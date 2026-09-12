import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.detection import Detection
from app.models.watchlist import Watchlist
from app.models.alert import Alert, AlertAction
from app.services.normalization import normalize_plate

def check_and_generate_alerts(db: Session, detection: Detection) -> Alert | None:
    """
    Evaluates detection against active watchlists and missing plate compliance, generating alerts if matched.
    """
    normalized = normalize_plate(detection.normalized_plate_text)
    raw_upper = (detection.raw_plate_text or "").upper().strip()

    # 1. Automatic Critical Alert for Missing License Plates (MVA Sec 39/192 Violation)
    is_missing_plate = (
        normalized in ["NOPLATE", "UNREGISTERED", "NO_PLATE", "PLATEMISSING", "MISSINGPLATE"] or
        raw_upper in ["NO-PLATE", "NO_PLATE", "NOPLATE", "UNREGISTERED", "NO PLATE", "PLATE MISSING"] or
        detection.ocr_confidence == 0.0
    )
    if is_missing_plate:
        existing_alert = db.query(Alert).filter(Alert.detection_id == detection.id).first()
        if not existing_alert:
            alert_id = f"alt-np-{uuid.uuid4().hex[:8]}"
            np_alert = Alert(
                id=alert_id,
                detection_id=detection.id,
                camera_id=detection.camera_id,
                watchlist_id=None,
                plate_matched="NO-PLATE",
                category="MISSING_PLATE_VIOLATION",
                severity="CRITICAL",
                status="NEW",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            action_log = AlertAction(
                id=f"act-{uuid.uuid4().hex[:8]}",
                alert_id=alert_id,
                user_id="sys-engine",
                username="Traffic Compliance Monitor",
                action="TRIGGER_ALERT",
                from_status="NONE",
                to_status="NEW",
                notes=f"CRITICAL VIOLATION: Vehicle operating without valid license plate (MVA Sec 39/192) detected at node {detection.camera_id}. Vehicle type: {detection.vehicle_type}.",
                created_at=datetime.now(timezone.utc)
            )
            detection.has_alert = True
            detection.alert_type = "MISSING_PLATE_VIOLATION"
            db.add(np_alert)
            db.add(action_log)
            db.commit()
            db.refresh(np_alert)
            return np_alert

    # 2. Query active watchlists
    matching_item = db.query(Watchlist).filter(
        Watchlist.is_active == True,
        Watchlist.normalized_plate == normalized
    ).first()
    
    if matching_item:
        # Create new Alert
        alert_id = f"alt-{uuid.uuid4().hex[:8]}"
        new_alert = Alert(
            id=alert_id,
            detection_id=detection.id,
            camera_id=detection.camera_id,
            watchlist_id=matching_item.id,
            plate_matched=normalized,
            category=matching_item.category,
            severity=matching_item.severity,
            status="NEW",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Initial action log
        action_log = AlertAction(
            id=f"act-{uuid.uuid4().hex[:8]}",
            alert_id=alert_id,
            user_id="sys-engine",
            username="Automated Watchlist Matcher",
            action="TRIGGER_ALERT",
            from_status="NONE",
            to_status="NEW",
            notes=f"Possible watchlist match with case: {matching_item.case_number or 'N/A'}",
            created_at=datetime.now(timezone.utc)
        )
        
        detection.has_alert = True
        detection.alert_type = matching_item.category
        
        db.add(new_alert)
        db.add(action_log)
        db.commit()
        db.refresh(new_alert)
        return new_alert

    # Automatic Priority Alert for Ambulances (Emergency Corridor Dispatch)
    if detection.vehicle_type == "Ambulance":
        existing_alert = db.query(Alert).filter(Alert.detection_id == detection.id).first()
        if not existing_alert:
            alert_id = f"alt-amb-{uuid.uuid4().hex[:8]}"
            amb_alert = Alert(
                id=alert_id,
                detection_id=detection.id,
                camera_id=detection.camera_id,
                watchlist_id=None,
                plate_matched=normalized,
                category="EMERGENCY_AMBULANCE",
                severity="HIGH",
                status="NEW",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            action_log = AlertAction(
                id=f"act-{uuid.uuid4().hex[:8]}",
                alert_id=alert_id,
                user_id="sys-engine",
                username="Emergency Corridor Controller",
                action="TRIGGER_ALERT",
                from_status="NONE",
                to_status="NEW",
                notes=f"Emergency Ambulance identified at {detection.camera_id}. Priority Green Corridor signal dispatch recommended.",
                created_at=datetime.now(timezone.utc)
            )
            detection.has_alert = True
            detection.alert_type = "EMERGENCY_AMBULANCE"
            db.add(amb_alert)
            db.add(action_log)
            db.commit()
            db.refresh(amb_alert)
            return amb_alert
        
    return None
