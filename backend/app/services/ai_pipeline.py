import os
import uuid
import json
import random
from datetime import datetime, timezone
import numpy as np
import cv2
from app.core.config import settings
from app.services.normalization import normalize_plate

SAMPLE_PLATES = [
    ("DL-01-AB-1234", "DL01AB1234", "Sedan"),
    ("MH-12-DE-5678", "MH12DE5678", "SUV"),
    ("KA-05-MJ-9988", "KA05MJ9988", "Commercial Truck"),
    ("WB-02-AK-4433", "WB02AK4433", "Transit Van"),
    ("TN-09-CQ-7711", "TN09CQ7711", "Sedan"),
    ("HR-26-DK-2020", "HR26DK2020", "SUV"),
    ("UP-32-BN-8800", "UP32BN8800", "Motorcycle"),
    ("GJ-01-RS-3344", "GJ01RS3344", "Sedan"),
    ("AP-28-ZZ-9999", "AP28ZZ9999", "SUV"),
    ("RJ-14-XY-1010", "RJ14XY1010", "Transit Van"),
    ("PB-02-GH-4545", "PB02GH4545", "Commercial Truck"),
    ("CH-01-TA-6677", "CH01TA6677", "Sedan")
]

def ensure_evidence_dirs():
    os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
    os.makedirs(settings.FEEDS_DIR, exist_ok=True)

def generate_synthetic_evidence_image(camera_id: str, plate_text: str, vehicle_type: str) -> tuple[str, str, dict, dict]:
    """
    Generates a realistic civic CCTV evidence frame with vehicle & plate bounding overlays.
    Returns: (full_frame_path, plate_crop_path, vehicle_bbox, plate_bbox)
    """
    ensure_evidence_dirs()
    
    img_w, img_h = 1280, 720
    # Background navy-slate tactical gradient
    frame = np.zeros((img_h, img_w, 3), dtype=np.uint8)
    frame[:] = (18, 22, 14) # BGR
    
    # Draw roadway grid lines
    cv2.line(frame, (100, img_h), (500, 250), (45, 55, 35), 2)
    cv2.line(frame, (img_w - 100, img_h), (img_w - 500, 250), (45, 55, 35), 2)
    cv2.line(frame, (img_w // 2, img_h), (img_w // 2, 250), (60, 75, 45), 2)
    
    # Vehicle bounding box (centered in lower lane)
    vx1, vy1 = 440, 320
    vx2, vy2 = 840, 620
    cv2.rectangle(frame, (vx1, vy1), (vx2, vy2), (40, 184, 216), 2) # Cyan bbox
    
    # Vehicle silhouette box
    cv2.rectangle(frame, (vx1 + 10, vy1 + 20), (vx2 - 10, vy2 - 10), (35, 42, 28), -1)
    
    # Plate bounding box
    px1, py1 = 560, 520
    px2, py2 = 720, 570
    cv2.rectangle(frame, (px1, py1), (px2, py2), (255, 255, 255), -1)
    cv2.rectangle(frame, (px1, py1), (px2, py2), (0, 0, 0), 2)
    
    # Draw Plate Text
    cv2.putText(frame, plate_text, (px1 + 10, py1 + 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    
    # Tactical CCTV watermark
    ts_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    cv2.putText(frame, f"CAM NODE: {camera_id} | {ts_str}", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 220, 240), 1)
    cv2.putText(frame, f"AI OVERLAY: {vehicle_type.upper()} [CONF 98.4%] | PLATE OCR: {plate_text}", (30, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (40, 184, 216), 1)
    
    # Filenames
    det_uuid = uuid.uuid4().hex[:12]
    full_frame_filename = f"frame_{camera_id}_{det_uuid}.jpg"
    plate_crop_filename = f"plate_{camera_id}_{det_uuid}.jpg"
    
    full_frame_path = os.path.join(settings.EVIDENCE_DIR, full_frame_filename)
    plate_crop_path = os.path.join(settings.EVIDENCE_DIR, plate_crop_filename)
    
    # Save full frame
    cv2.imwrite(full_frame_path, frame)
    
    # Crop plate region with padding
    plate_crop = frame[max(0, py1 - 10):min(img_h, py2 + 10), max(0, px1 - 10):min(img_w, px2 + 10)]
    cv2.imwrite(plate_crop_path, plate_crop)
    
    vehicle_bbox = {"ymin": vy1 / img_h, "xmin": vx1 / img_w, "ymax": vy2 / img_h, "xmax": vx2 / img_w}
    plate_bbox = {"ymin": py1 / img_h, "xmin": px1 / img_w, "ymax": py2 / img_h, "xmax": px2 / img_w}
    
    return (
        f"/static/evidence/{full_frame_filename}",
        f"/static/evidence/{plate_crop_filename}",
        vehicle_bbox,
        plate_bbox
    )

def simulate_pipeline_inference(camera_id: str, custom_raw_plate: str | None = None) -> dict:
    """
    Simulates a complete detection and OCR inference step for a camera.
    """
    if custom_raw_plate:
        raw_plate = custom_raw_plate
        norm_plate = normalize_plate(raw_plate)
        vehicle_type = "Sedan"
    else:
        raw_plate, norm_plate, vehicle_type = random.choice(SAMPLE_PLATES)
        
    full_uri, crop_uri, v_box, p_box = generate_synthetic_evidence_image(camera_id, raw_plate, vehicle_type)
    
    confidence = round(random.uniform(0.91, 0.99), 3)
    ocr_conf = round(random.uniform(0.88, 0.98), 3)
    
    return {
        "camera_id": camera_id,
        "raw_plate_text": raw_plate,
        "normalized_plate_text": norm_plate,
        "confidence_score": confidence,
        "ocr_confidence": ocr_conf,
        "model_version": "YOLOv8-ANPR-v2.4",
        "vehicle_type": vehicle_type,
        "bounding_box": json.dumps(v_box),
        "plate_bounding_box": json.dumps(p_box),
        "evidence_image_uri": full_uri,
        "plate_crop_uri": crop_uri,
        "processing_status": "COMPLETED"
    }
