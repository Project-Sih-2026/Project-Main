import os
import sys
import json
from typing import Dict, List, Optional
import numpy as np

# Set UTF-8 encoding for Windows terminal
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_pipeline.anpr_engine import HighPrecisionANPR
from ai_pipeline.detect_multi_vehicle_scene import MultiVehicleSceneDetector
from ai_pipeline.trajectory_engine import TrajectoryReconstructionEngine
from ai_pipeline.analytics_engine import CityTrafficAnalyticsEngine
from ai_pipeline.alert_engine import RealTimeAlertEngine


class UnifiedCityTrafficAI:
    """
    Enterprise-Grade Unified City Traffic & ANPR AI Platform.
    Integrates:
      1. High-Precision Deep OCR Engine (>90% accuracy on Indian license plates)
      2. Trajectory Reconstruction & Map-Matching Engine
      3. City Traffic Analytics & LoS Congestion Engine
      4. Real-Time Watchlist & Anomaly Alert System
    """

    def __init__(self):
        print("⚡ Loading Unified City Traffic AI Platform...")
        self.scene_detector = MultiVehicleSceneDetector()
        self.anpr_engine = self.scene_detector.anpr
        self.trajectory_engine = TrajectoryReconstructionEngine()
        self.analytics_engine = CityTrafficAnalyticsEngine()
        self.alert_engine = RealTimeAlertEngine()
        print("✅ All 4 Core AI Modules Initialized Successfully!\n")

    def process_live_camera_feed(self, scene_image_path_or_array, camera_code: str = "CAM-01") -> Dict:
        """
        Pillar 1 + 4: Detects all vehicle plates in the scene and checks watchlists in real time.
        """
        scene_result = self.scene_detector.process_scene_image(scene_image_path_or_array)
        if scene_result.get("status") != "SUCCESS":
            return scene_result

        enriched_detections = []
        for veh in scene_result.get("vehicles", []):
            plate = veh["plate_number"]
            # Evaluate against alert engine
            alert_eval = self.alert_engine.evaluate_detection(
                plate=plate,
                camera_code=camera_code,
                speed_kph=55.0, # Default or radar-linked
                timestamp="Live Feed"
            )
            veh["compliance_status"] = alert_eval["compliance_status"]
            veh["is_flagged"] = alert_eval["is_flagged"]
            veh["alerts"] = alert_eval["alerts"]
            enriched_detections.append(veh)

        return {
            "status": "SUCCESS",
            "camera_code": camera_code,
            "total_vehicles_detected": len(enriched_detections),
            "detections": enriched_detections
        }

    def query_vehicle_trajectory(self, plate: str, historical_sightings: List[Dict]) -> Dict:
        """
        Pillar 2: Reconstructs chronological spatiotemporal road route across city cameras.
        """
        return self.trajectory_engine.reconstruct_trajectory(plate, historical_sightings)

    def analyze_city_network(self, camera_telemetry: List[Dict]) -> Dict:
        """
        Pillar 3: Analyzes network-wide Level-of-Service (LoS), bottlenecks, and flow densities.
        """
        return self.analytics_engine.generate_corridor_analytics(camera_telemetry)
