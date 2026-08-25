import io
import csv
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.detection import Detection
from app.models.alert import Alert
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/export", tags=["Policy Exports"])

@router.get("/detections/csv")
def export_detections_csv(
    current_user: User = Depends(require_role(["ROLE_ADMIN", "ROLE_OPERATOR"])),
    db: Session = Depends(get_db)
):
    detections = db.query(Detection).order_by(Detection.timestamp.desc()).limit(1000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Classification Watermark Header
    writer.writerow(["# SENSITIVE CIVIC OPERATIONS EXPORT - OFFICIAL USE ONLY"])
    writer.writerow([f"# Exported By: {current_user.username} ({current_user.role}) on {datetime.now(timezone.utc).isoformat()}"])
    writer.writerow([
        "Detection ID", "Camera ID", "Timestamp (UTC)", "Raw OCR Text",
        "Normalized Plate", "Confidence", "Vehicle Type", "Status", "Corrected Plate"
    ])
    
    for d in detections:
        writer.writerow([
            d.id, d.camera_id, d.timestamp.isoformat(), d.raw_plate_text,
            d.normalized_plate_text, d.confidence_score, d.vehicle_type,
            d.review_status, d.corrected_plate_text or "N/A"
        ])
        
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="DATA_EXPORT",
        target_type="EXPORT",
        details={"format": "CSV", "record_count": len(detections), "type": "DETECTIONS"}
    )
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=traffic_detections_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

@router.get("/alerts/csv")
def export_alerts_csv(
    current_user: User = Depends(require_role(["ROLE_ADMIN", "ROLE_OPERATOR"])),
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["# SENSITIVE CIVIC OPERATIONS EXPORT - ALERT LOGS"])
    writer.writerow([f"# Exported By: {current_user.username} on {datetime.now(timezone.utc).isoformat()}"])
    writer.writerow([
        "Alert ID", "Detection ID", "Camera ID", "Matched Plate",
        "Category", "Severity", "Status", "Assigned To", "Dismissal Reason", "Resolution Notes"
    ])
    
    for a in alerts:
        writer.writerow([
            a.id, a.detection_id, a.camera_id, a.plate_matched,
            a.category, a.severity, a.status, a.assigned_to or "Unassigned",
            a.dismissal_reason or "N/A", a.resolution_notes or ""
        ])
        
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="DATA_EXPORT",
        target_type="EXPORT",
        details={"format": "CSV", "record_count": len(alerts), "type": "ALERTS"}
    )
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=watchlist_alerts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )
