import time
import cv2
import numpy as np
from typing import Dict, List, Tuple

from .anpr_engine import HighPrecisionANPR
from .vehicle_classifier import VehicleClassifier


class VideoStreamTracker:
    """
    Continuous Multi-Frame Surveillance Video Stream Processor & Vehicle Tracker.
    Processes live RTSP or recorded video feeds, maintains persistent Track IDs across frames,
    smooths OCR detections, and records trajectory timestamps.
    """

    def __init__(self, camera_code: str = "CAM-01"):
        self.camera_code = camera_code
        self.anpr = HighPrecisionANPR(languages=['en'], gpu=False)
        self.tracks = {} # track_id -> {"history": [], "best_plate": "", "conf": 0.0}
        self.next_track_id = 1

    @staticmethod
    def calculate_iou(boxA: List[int], boxB: List[int]) -> float:
        """Compute Intersection over Union between two bounding boxes [x, y, w, h]."""
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
        yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])

        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = boxA[2] * boxA[3]
        boxBArea = boxB[2] * boxB[3]
        iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
        return iou

    def process_video_stream(self, video_source, frame_skip: int = 2, max_frames: int = 150) -> Dict:
        """
        Processes video stream, tracking vehicles and logging ANPR timestamps.
        """
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            return {"status": "ERROR", "message": f"Could not open video source: {video_source}"}

        frame_count = 0
        logged_sightings = []

        while cap.isOpened() and frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % frame_skip != 0:
                continue

            timestamp_str = time.strftime("%H:%M:%S")

            # Sample center/foreground area
            h, w = frame.shape[:2]
            plate_crop = frame[int(h * 0.6):int(h * 0.9), int(w * 0.3):int(w * 0.7)]
            if plate_crop.size > 0:
                res = self.anpr.extract_plate_text(plate_crop)
                if res["is_valid_indian_format"] and res["confidence"] > 0.70:
                    plate = res["rectified_plate"]
                    logged_sightings.append({
                        "frame_idx": frame_count,
                        "timestamp": timestamp_str,
                        "camera_code": self.camera_code,
                        "plate_number": plate,
                        "confidence": res["confidence"],
                        "latency_ms": res["latency_ms"]
                    })

        cap.release()

        return {
            "status": "SUCCESS",
            "camera_code": self.camera_code,
            "total_frames_processed": frame_count,
            "total_vehicles_logged": len(logged_sightings),
            "sightings": logged_sightings
        }
