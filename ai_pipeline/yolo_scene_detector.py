import os
import sys
import json
import cv2
import numpy as np

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ultralytics import YOLO
from ai_pipeline.anpr_engine import HighPrecisionANPR
from ai_pipeline.indian_syntax_rectifier import IndianSyntaxRectifier
from ai_pipeline.vehicle_classifier import VehicleClassifier


class FullSceneYOLODetector:
    """
    State-of-the-Art Multi-Class City Traffic & ANPR Intelligence System.
    Combines:
      - YOLOv8 Object Detection (Vehicles, Persons/Riders, Traffic Infrastructure)
      - Sub-Pixel License Plate Region Localizer
      - Dual-Pass Super-Resolution OCR Engine
      - Vehicle Visual Attribute Classifier (Make/Model class, Paint Color, Plate Type)
    """

    CLASS_COLORS = {
        "car": (255, 120, 0),          # Blue in BGR
        "motorcycle": (255, 60, 60),    # Blue-Purple
        "bus": (220, 160, 0),          # Deep Blue
        "truck": (180, 130, 0),        # Teal/Blue
        "person": (0, 0, 255),          # Red in BGR
        "bicycle": (255, 220, 0),      # Cyan
        "traffic light": (0, 165, 255), # Orange in BGR
        "stop sign": (0, 255, 255),     # Yellow in BGR
    }

    def __init__(self, model_name: str = "best.pt"):
        # Auto-detect available YOLO model weights (best.pt)
        if not os.path.exists(model_name):
            for candidate in ["best.pt", "models/best.pt", "../best.pt", "backend/models/best.pt"]:
                if os.path.exists(candidate):
                    model_name = candidate
                    break
        print(f"⚡ Loading YOLO High-Precision Plate Detection Model ({model_name})...")
        self.model = YOLO(model_name)
        self.anpr = HighPrecisionANPR(languages=['en'], gpu=False)
        print(f"✅ High-Precision YOLO ({model_name}) + ANPR Model Ready!\n")

    def locate_subpixel_plate_crop(self, vehicle_crop: np.ndarray) -> Optional[np.ndarray]:
        """
        Locates the exact license plate rectangle within a vehicle bounding box
        using edge gradients and aspect ratio heuristics (2.0 to 5.5).
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return None

        vh, vw = vehicle_crop.shape[:2]
        # Focus on lower 55% of the vehicle (standard bumper region)
        bumper_region = vehicle_crop[int(vh * 0.45):int(vh * 0.98), int(vw * 0.08):int(vw * 0.92)]
        if bumper_region.size == 0:
            return None

        gray = cv2.cvtColor(bumper_region, cv2.COLOR_BGR2GRAY)
        rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (13, 5))
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, rect_kernel)

        grad_x = cv2.Sobel(blackhat, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
        grad_x = np.absolute(grad_x)
        min_v, max_v = np.min(grad_x), np.max(grad_x)
        grad_x = (255 * ((grad_x - min_v) / (max_v - min_v + 1e-6))).astype("uint8")

        grad_x = cv2.GaussianBlur(grad_x, (5, 5), 0)
        _, thresh = cv2.threshold(grad_x, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, rect_kernel)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        best_crop = None
        best_area = 0

        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            aspect = w / float(h)
            area = w * h
            if 1.8 <= aspect <= 5.8 and area > best_area and area > 600:
                pad_x = int(w * 0.10)
                pad_y = int(h * 0.15)
                x0 = max(0, x - pad_x)
                y0 = max(0, y - pad_y)
                x1 = min(bumper_region.shape[1], x + w + pad_x)
                y1 = min(bumper_region.shape[0], y + h + pad_y)

                best_crop = bumper_region[y0:y1, x0:x1]
                best_area = area

        return best_crop if best_crop is not None else bumper_region

    def process_and_annotate_scene(self, image_path: str, output_path: str = "ai_pipeline/yolo_annotated_output.jpg") -> dict:
        """
        Runs full multi-class detection, performs plate OCR on vehicle crops,
        and generates the color-coded annotated surveillance image.
        """
        if not os.path.exists(image_path):
            return {"status": "ERROR", "message": f"File not found: {image_path}"}

        img = cv2.imread(image_path)
        h, w = img.shape[:2]
        annotated_img = img.copy()

        # 1. Run YOLO inference
        results = self.model(img, verbose=False)[0]

        detected_entities = []
        vehicles_count = 0
        persons_count = 0
        infrastructure_count = 0

        for box in results.boxes:
            cls_id = int(box.cls[0].item())
            cls_name = self.model.names[cls_id]
            conf = float(box.conf[0].item())
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]

            # Filter relevant urban traffic classes
            if cls_name not in ["car", "motorcycle", "bus", "truck", "person", "bicycle", "traffic light", "stop sign"]:
                continue

            if conf < 0.25:
                continue

            box_color = self.CLASS_COLORS.get(cls_name, (0, 255, 0))
            plate_info = None
            attrs = None

            # If vehicle, crop and check for license plate
            if cls_name in ["car", "motorcycle", "bus", "truck"]:
                vehicles_count += 1
                veh_crop = img[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
                
                if veh_crop.size > 0:
                    plate_crop = self.locate_subpixel_plate_crop(veh_crop)
                    attrs = VehicleClassifier.infer_vehicle_attributes(veh_crop, plate_crop)

                    if plate_crop is not None and plate_crop.size > 0:
                        ocr_res = self.anpr.extract_plate_text(plate_crop)
                        if ocr_res["is_valid_indian_format"] or (ocr_res["confidence"] > 0.65 and len(ocr_res["rectified_plate"]) >= 7):
                            plate_info = ocr_res["rectified_plate"]

            elif cls_name == "person":
                persons_count += 1
            else:
                infrastructure_count += 1

            # Draw Bounding Box (thick surveillance style)
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), box_color, 2)

            # Label banner
            label_text = f"{cls_name.upper()} {conf*100:.0f}%"
            if plate_info:
                label_text += f" | {plate_info}"
            elif attrs:
                label_text += f" | {attrs['body_color']}"

            # Text background pill
            (text_w, text_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(annotated_img, (x1, max(0, y1 - text_h - 6)), (x1 + text_w + 4, max(text_h + 6, y1)), box_color, -1)
            cv2.putText(annotated_img, label_text, (x1 + 2, max(text_h, y1 - 3)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

            detected_entities.append({
                "class": cls_name,
                "confidence": round(conf, 2),
                "bbox": [x1, y1, x2 - x1, y2 - y1],
                "plate": plate_info,
                "attributes": attrs
            })

        cv2.imwrite(output_path, annotated_img)

        return {
            "status": "SUCCESS",
            "image_resolution": f"{w}x{h} px",
            "summary": {
                "vehicles_detected": vehicles_count,
                "persons_riders_detected": persons_count,
                "traffic_infrastructure_detected": infrastructure_count,
                "total_objects": len(detected_entities)
            },
            "annotated_image_saved": output_path,
            "entities": detected_entities
        }
