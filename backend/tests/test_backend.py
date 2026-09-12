import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.camera import Camera
from app.models.user import User
from app.models.detection import Detection
from app.models.ocr_correction import OCRCorrection
from app.models.alert import Alert
from seed_data import seed_database

TEST_DATABASE_URL = "sqlite:///./data/test_traffic_isolated.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

# Seed cameras & system essentials into isolated test database
_db_test = TestingSessionLocal()
seed_database(target_db=_db_test)
_db_test.close()

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "OPERATIONAL"

def test_cameras_list():
    response = client.get("/api/v1/cameras")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 20
    assert any(c["id"] == "CAM-KN-01" for c in data)
    assert any(c["id"] == "CAM-GN-01" for c in data)

def test_camera_telemetry():
    response = client.get("/api/v1/cameras/CAM-KN-01/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["camera_id"] == "CAM-KN-01"
    assert "throughput_mbps" in data
    assert "ping_ms" in data

def test_camera_distances_and_nearest():
    response = client.get("/api/v1/cameras/distances")
    assert response.status_code == 200
    data = response.json()
    assert data["total_cameras"] == 20
    assert data["all_pairs_count"] == 380
    assert "CAM-KN-01" in data["matrix"]
    assert "CAM-KN-02" in data["matrix"]["CAM-KN-01"]

    near_res = client.get("/api/v1/cameras/CAM-KN-01/nearest")
    assert near_res.status_code == 200
    near_data = near_res.json()
    assert near_data["nearest"][0]["camera_id"] in ["CAM-KN-02", "CAM-GN-07"]

def test_detections_and_dual_storage():
    # Ingest a detection to ensure at least one record exists
    client.post("/api/v1/detections/ingest", json={
        "camera_id": "CAM-KN-01",
        "plate_text": "DL 01 AB 1234",
        "confidence_score": 0.95,
        "vehicle_type": "Sedan"
    })
    response = client.get("/api/v1/detections")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    sample = data[0]
    # Check that raw OCR and normalized OCR are stored separately
    assert "raw_plate_text" in sample
    assert "normalized_plate_text" in sample

def test_ocr_correction_immutable_audit():
    # Ingest a detection to ensure target detection exists
    client.post("/api/v1/detections/ingest", json={
        "camera_id": "CAM-KN-01",
        "plate_text": "DL 01 AB 1234",
        "confidence_score": 0.95,
        "vehicle_type": "Sedan"
    })
    # 1. Fetch a detection
    det_res = client.get("/api/v1/detections")
    detections = det_res.json()
    target_det = detections[0]
    det_id = target_det["id"]
    original_raw = target_det["raw_plate_text"]
    
    # 2. Submit correction
    corr_payload = {
        "corrected_plate": "DL01AB9999",
        "reason": "MISREAD_CHARACTER",
        "notes": "Character 1 misread as letter I in heavy glare"
    }
    corr_res = client.post(f"/api/v1/detections/{det_id}/correct", json=corr_payload)
    assert corr_res.status_code == 200
    corr_data = corr_res.json()
    assert corr_data["original_ocr"] == original_raw
    assert corr_data["corrected_plate"] == "DL01AB9999"
    assert corr_data["reason"] == "MISREAD_CHARACTER"
    
    # 3. Verify detection record updated reference without modifying raw_plate_text
    updated_det = client.get(f"/api/v1/detections/{det_id}").json()
    assert updated_det["raw_plate_text"] == original_raw  # MUST REMAIN UNCHANGED
    assert updated_det["is_corrected"] is True
    assert updated_det["corrected_plate_text"] == "DL01AB9999"

def test_vehicle_journey_discrete_observations():
    # Ingest detection to ensure vehicle observations exist
    client.post("/api/v1/detections/ingest", json={
        "camera_id": "CAM-KN-01",
        "plate_text": "DL 01 AB 1234",
        "confidence_score": 0.95,
        "vehicle_type": "Sedan"
    })
    response = client.get("/api/v1/vehicles/DL01AB1234/history")
    assert response.status_code == 200
    data = response.json()
    assert data["plate"] == "DL01AB1234"
    assert "observation_stops" in data
    assert len(data["observation_stops"]) >= 1
    # Check that epistemic restraint disclaimer is present
    assert "Discrete camera observation sequence" in data["disclaimer"]

def test_alerts_queue_and_mandatory_dismissal_reason():
    # 1. Ingest a detection matching watchlist to ensure active alert exists
    client.post("/api/v1/detections/ingest", json={
        "camera_id": "CAM-KN-01",
        "plate_text": "DL01AB1234",
        "confidence_score": 0.98,
        "vehicle_type": "Sedan"
    })
    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    alert_id = alerts[0]["id"]
    
    # 2. Try dismissing without reason (Must fail per PRD REQ-ALERT-04)
    bad_dismiss = client.post(f"/api/v1/alerts/{alert_id}/action", json={
        "action": "DISMISS"
    })
    assert bad_dismiss.status_code == 400
    
    # 3. Dismiss with valid reason
    valid_dismiss = client.post(f"/api/v1/alerts/{alert_id}/action", json={
        "action": "DISMISS",
        "reason": "FALSE_POSITIVE_OCR",
        "notes": "Verified by dispatcher Marcus"
    })
    assert valid_dismiss.status_code == 200
    assert valid_dismiss.json()["status"] == "DISMISSED"
    assert valid_dismiss.json()["dismissal_reason"] == "FALSE_POSITIVE_OCR"

def test_analytics_kpi_distinction():
    response = client.get("/api/v1/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_detection_events" in data
    assert "unique_normalized_plates" in data
    assert data["total_detection_events"] >= data["unique_normalized_plates"]

def test_system_health():
    response = client.get("/api/v1/health/system")
    assert response.status_code == 200
    data = response.json()
    assert data["connectivity_status"] == "OPTIMAL"
    assert "ocr_failure_rate_pct" in data

def test_audit_logging():
    response = client.get("/api/v1/audit/logs")
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) >= 1
    actions = [l["action_type"] for l in logs]
    assert any("OCR_CORRECTION" in a or "ALERT" in a or "AUTH" in a for a in actions)

def test_ingest_and_multi_hop_route_tracking():
    # Ingest detection at Camera 1
    ingest_res1 = client.post("/api/v1/detections/ingest", json={
        "camera_id": "CAM-001",
        "plate_text": "DL 09 XY 9999",
        "confidence_score": 0.96,
        "vehicle_type": "SUV"
    })
    assert ingest_res1.status_code == 200
    assert ingest_res1.json()["normalized_plate_text"] == "DL09XY9999"

    # Ingest detection at Camera 2
    ingest_res2 = client.post("/api/v1/detections/ingest", json={
        "camera_id": "CAM-002",
        "plate_text": "DL-09-XY-9999",
        "confidence_score": 0.94,
        "vehicle_type": "SUV"
    })
    assert ingest_res2.status_code == 200

    # Ingest batch with Camera 3
    batch_res = client.post("/api/v1/detections/ingest/batch", json={
        "detections": [
            {"camera_id": "CAM-003", "plate_text": "DL09XY9999", "vehicle_type": "SUV"},
            {"camera_id": "CAM-004", "plate_text": "HR26DK8888", "vehicle_type": "Sedan"}
        ]
    })
    assert batch_res.status_code == 200
    assert len(batch_res.json()) == 2

    # Query vehicle history sequence
    history_res = client.get("/api/v1/vehicles/DL09XY9999/history")
    assert history_res.status_code == 200
    history = history_res.json()
    assert history["total_observations"] >= 3
    assert history["total_distance_km"] >= 0
    assert len(history["observation_stops"]) >= 3
    assert history["observation_stops"][0]["stop_number"] == 1
    assert history["observation_stops"][1]["stop_number"] == 2

def test_yolo_ai_model_metadata_and_inference():
    # 1. Test AI Model Info Endpoint
    info_res = client.get("/api/v1/detections/ai/model-info")
    assert info_res.status_code == 200
    info = info_res.json()
    assert info["status"] in ["LOADED", "FALLBACK"]
    assert info["architecture"] == "YOLOv8-ANPR-Custom"
    assert info["plate_class_id"] == 80
    assert "license_plate" in str(info["classes"]) or "number_plate" in str(info["classes"])

    # 2. Test Direct Inference on Frame Upload
    import numpy as np
    import cv2
    import io

    # Create synthetic frame with dummy vehicle
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(frame, (100, 100), (540, 400), (200, 200, 200), -1)
    cv2.putText(frame, "DL-01-AB-1234", (150, 350), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    _, encoded = cv2.imencode(".jpg", frame)
    
    file_bytes = io.BytesIO(encoded.tobytes())
    files = {"file": ("test_frame.jpg", file_bytes, "image/jpeg")}
    
    infer_res = client.post("/api/v1/detections/infer-frame?camera_id=CAM-KN-01&custom_plate=DL-01-AB-1234", files=files)
    assert infer_res.status_code == 200
    data = infer_res.json()
    assert data["camera_id"] == "CAM-KN-01"
    assert data["normalized_plate_text"] == "DL01AB1234"
    assert data["confidence_score"] > 0.8
    assert "evidence_image_uri" in data
    assert "plate_crop_uri" in data

def test_timestamped_observation_route_and_camera_sequence():
    import numpy as np
    import cv2
    import io
    import uuid

    test_plate = f"HR26{uuid.uuid4().hex[:4].upper()}"

    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    _, encoded = cv2.imencode(".jpg", frame)

    # Checkpoint 1 at 10:00 AM
    files1 = {"file": ("cam1.jpg", io.BytesIO(encoded.tobytes()), "image/jpeg")}
    r1 = client.post(
        f"/api/v1/detections/upload-route?camera_id=CAM-KN-01&custom_plate={test_plate}&owner_name=Vipul%20Sharma&timestamp=2026-09-12T10:00:00",
        files=files1
    )
    assert r1.status_code == 200
    d1 = r1.json()["detection"]
    assert d1["camera_id"] == "CAM-KN-01"
    assert d1["normalized_plate_text"] == test_plate
    assert "2026-09-12T10:00:00" in d1["timestamp"]

    # Checkpoint 2 at 10:15 AM
    files2 = {"file": ("cam2.jpg", io.BytesIO(encoded.tobytes()), "image/jpeg")}
    r2 = client.post(
        f"/api/v1/detections/upload-route?camera_id=CAM-KN-02&custom_plate={test_plate}&owner_name=Vipul%20Sharma&timestamp=2026-09-12T10:15:00",
        files=files2
    )
    assert r2.status_code == 200
    j2 = r2.json()["journey"]
    assert j2 is not None
    assert j2["total_observations"] == 2
    assert j2["total_duration_mins"] == 15.0
    assert len(j2["observation_stops"]) == 2
    assert j2["observation_stops"][0]["camera_id"] == "CAM-KN-01"
    assert j2["observation_stops"][1]["camera_id"] == "CAM-KN-02"
    assert j2["observation_stops"][1]["duration_mins_from_prev"] == 15.0



