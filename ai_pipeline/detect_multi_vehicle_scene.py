import os
import sys
import json
import cv2
import numpy as np
from typing import Dict, List, Tuple

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.anpr_engine import HighPrecisionANPR
from ai_pipeline.indian_syntax_rectifier import IndianSyntaxRectifier


class MultiVehicleSceneDetector:
    """
    End-to-End Multi-Lane Highway & City Traffic Scene Plate Detector.
    Scans a full full-resolution surveillance camera image, detects all vehicles,
    extracts license plate crops, and returns recognized plates with bounding boxes.
    """

    def __init__(self):
        print("Initializing High-Precision Multi-Vehicle Scene Detector...")
        self.anpr = HighPrecisionANPR(languages=['en'], gpu=False)

    def find_license_plate_candidates(self, scene_img: np.ndarray) -> List[Tuple[int, int, int, int, np.ndarray]]:
        """
        Locates potential license plate regions in a multi-vehicle highway image
        using edge gradients, contour aspect ratios (width/height 2.0 - 5.5), and morphological filtering.
        Returns: List of (x, y, w, h, cropped_plate_img)
        """
        h_orig, w_orig = scene_img.shape[:2]
        gray = cv2.cvtColor(scene_img, cv2.COLOR_BGR2GRAY)

        # 1. Morphological Blackhat to highlight dark/bright plate characters on rectangle
        rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (13, 5))
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, rect_kernel)

        # 2. Sobel Edge Detection along X-axis (vertical character strokes)
        grad_x = cv2.Sobel(blackhat, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
        grad_x = np.absolute(grad_x)
        (min_val, max_val) = (np.min(grad_x), np.max(grad_x))
        grad_x = (255 * ((grad_x - min_val) / (max_val - min_val + 1e-6))).astype("uint8")

        # 3. Blur & Otsu Threshold
        grad_x = cv2.GaussianBlur(grad_x, (5, 5), 0)
        _, thresh = cv2.threshold(grad_x, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        # 4. Morphological Close to connect characters into a single plate bounding block
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, rect_kernel)
        thresh = cv2.erode(thresh, None, iterations=2)
        thresh = cv2.dilate(thresh, None, iterations=2)

        # 5. Find Contours matching standard license plate geometry
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        candidates = []

        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            aspect_ratio = w / float(h)
            area = w * h

            # Typical Indian plate aspect ratio is between 2.2 and 5.5
            # Filter by area to exclude tiny artifacts and full car bodies
            if 2.0 <= aspect_ratio <= 5.8 and 1200 <= area <= 60000:
                # Add margin around plate
                pad_x = int(w * 0.08)
                pad_y = int(h * 0.12)
                x0 = max(0, x - pad_x)
                y0 = max(0, y - pad_y)
                x1 = min(w_orig, x + w + pad_x)
                y1 = min(h_orig, y + h + pad_y)

                crop = scene_img[y0:y1, x0:x1]
                if crop.size > 0:
                    candidates.append((x0, y0, x1 - x0, y1 - y0, crop))

        # Sort candidates top-to-bottom, left-to-right (lane order)
        candidates.sort(key=lambda c: (c[1] // 50, c[0]))
        return candidates

    def process_scene_image(self, image_path_or_array, save_annotated_path: str = None) -> Dict:
        """
        Processes a full scene image, detects all passing vehicles, and returns recognized plates.
        """
        if isinstance(image_path_or_array, str):
            if not os.path.exists(image_path_or_array):
                return {"status": "ERROR", "message": f"File not found: {image_path_or_array}"}
            img = cv2.imread(image_path_or_array)
        else:
            img = image_path_or_array

        if img is None:
            return {"status": "ERROR", "message": "Failed to decode image"}

        annotated_img = img.copy()
        candidates = self.find_license_plate_candidates(img)
        detections = []

        # If standard contour search found no small crops, scan the whole image directly
        if not candidates:
            # Full frame scan
            res = self.anpr.extract_plate_text(img)
            if res["is_valid_indian_format"] or res["confidence"] > 0.65:
                state_code = res['rectified_plate'].split('-')[0] if '-' in res['rectified_plate'] else 'UNKNOWN'
                state_name = IndianSyntaxRectifier.INDIAN_STATES.get(state_code, "Indian Jurisdiction")
                detections.append({
                    "vehicle_id": 1,
                    "bbox": [0, 0, img.shape[1], img.shape[0]],
                    "raw_ocr": res["raw_ocr"],
                    "plate_number": res["rectified_plate"],
                    "state": f"{state_name} ({state_code})",
                    "confidence": f"{res['confidence'] * 100:.1f}%",
                    "is_valid_format": res["is_valid_indian_format"],
                    "latency_ms": res["latency_ms"]
                })
        else:
            veh_count = 0
            seen_plates = set()

            for x, y, w, h, crop in candidates:
                res = self.anpr.extract_plate_text(crop)
                plate = res["rectified_plate"]

                # Deduplicate and validate
                if plate not in seen_plates and (res["is_valid_indian_format"] or res["confidence"] > 0.60):
                    seen_plates.add(plate)
                    veh_count += 1
                    state_code = plate.split('-')[0] if '-' in plate else 'UNKNOWN'
                    state_name = IndianSyntaxRectifier.INDIAN_STATES.get(state_code, "Indian Jurisdiction")

                    detections.append({
                        "vehicle_id": veh_count,
                        "bbox": [x, y, w, h],
                        "raw_ocr": res["raw_ocr"],
                        "plate_number": plate,
                        "state": f"{state_name} ({state_code})",
                        "confidence": f"{res['confidence'] * 100:.1f}%",
                        "is_valid_format": res["is_valid_indian_format"],
                        "latency_ms": res["latency_ms"]
                    })

                    # Draw visual bounding box & label on annotated image
                    cv2.rectangle(annotated_img, (x, y), (x + w, y + h), (0, 220, 0), 2)
                    label = f"#{veh_count} {plate}"
                    cv2.putText(annotated_img, label, (x, max(20, y - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        if save_annotated_path and detections:
            cv2.imwrite(save_annotated_path, annotated_img)

        return {
            "status": "SUCCESS",
            "total_vehicles_detected": len(detections),
            "vehicles": detections
        }


def run_scene_detection(image_path: str):
    detector = MultiVehicleSceneDetector()
    print(f"\n📸 Scanning Scene Image: {image_path}")
    result = detector.process_scene_image(image_path, save_annotated_path="ai_pipeline/annotated_output.jpg")
    print(json.dumps(result, indent=4))
    return result


if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_scene_detection(sys.argv[1])
    else:
        print("Usage: python ai_pipeline/detect_multi_vehicle_scene.py <path_to_image>")
