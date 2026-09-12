import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.detection import Detection
from app.models.watchlist import Watchlist
from app.models.alert import Alert, AlertAction
from app.services.normalization import normalize_plate

def check_and_generate_alerts(db: Session, detection: Detection) -> Alert | None:
    """
    Evaluates detection against active watchlists and generates an alert if matched.
    """
    normalized = normalize_plate(detection.normalized_plate_text)
    
    # Query active watchlists
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
