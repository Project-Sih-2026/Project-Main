import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.detection import Detection
from app.models.ocr_correction import OCRCorrection
from app.models.alert import Alert

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "OPERATIONAL"

def test_cameras_list():
    response = client.get("/api/v1/cameras")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(c["id"] == "CAM-022" for c in data)

def test_camera_telemetry():
    response = client.get("/api/v1/cameras/CAM-022/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["camera_id"] == "CAM-022"
    assert "throughput_mbps" in data
    assert "ping_ms" in data

def test_detections_and_dual_storage():
    response = client.get("/api/v1/detections")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    sample = data[0]
    # Check that raw OCR and normalized OCR are stored separately
    assert "raw_plate_text" in sample
    assert "normalized_plate_text" in sample

def test_ocr_correction_immutable_audit():
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
    response = client.get("/api/v1/vehicles/DL01AB1234/history")
    assert response.status_code == 200
    data = response.json()
    assert data["plate"] == "DL01AB1234"
    assert "observation_stops" in data
    assert len(data["observation_stops"]) >= 1
    # Check that epistemic restraint disclaimer is present
    assert "Discrete camera observation sequence" in data["disclaimer"]

def test_alerts_queue_and_mandatory_dismissal_reason():
    # 1. Get active alerts
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
