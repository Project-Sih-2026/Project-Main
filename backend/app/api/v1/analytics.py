from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.detection import Detection
from app.models.camera import Camera
from app.models.alert import Alert
from app.schemas.analytics import AnalyticsKPISummary, VolumeTrendPoint, HotspotIntersection

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/kpis", response_model=AnalyticsKPISummary)
def get_kpis(db: Session = Depends(get_db)):
    total_detections = db.query(Detection).count()
    
    # Strictly distinct unique normalized plates per PRD REQ-ANALYTICS-03
    unique_plates = db.query(func.count(distinct(Detection.normalized_plate_text))).scalar() or 0
    active_cameras = db.query(Camera).filter(Camera.status.in_(["nominal", "scanning"])).count()
    review_required = db.query(Detection).filter(Detection.processing_status == "REVIEW_REQUIRED").count()
    active_alerts = db.query(Alert).filter(Alert.status.in_(["NEW", "ACKNOWLEDGED", "ASSIGNED", "ESCALATED"])).count()
    
    return AnalyticsKPISummary(
        total_detection_events=total_detections,
        unique_normalized_plates=unique_plates,
        active_cameras_count=active_cameras,
        review_required_count=review_required,
        active_alerts_count=active_alerts,
        system_health_status="OPTIMAL"
    )

@router.get("/volume-trends", response_model=list[VolumeTrendPoint])
def get_volume_trends(db: Session = Depends(get_db)):
    """
    Returns 24-hour volume trend data with distinction between total events and unique plates.
    """
    now = datetime.now(timezone.utc)
    trends = []
    
    for i in range(12, -1, -1):
        slot_time = now - timedelta(hours=i * 2)
        slot_start = slot_time - timedelta(hours=2)
        slot_label = slot_time.strftime("%H:00")
        
        base_count = db.query(Detection).filter(
            Detection.timestamp >= slot_start,
            Detection.timestamp < slot_time
        ).count()
        
        unique_count = db.query(func.count(distinct(Detection.normalized_plate_text))).filter(
            Detection.timestamp >= slot_start,
            Detection.timestamp < slot_time
        ).scalar() or 0
        
        trends.append(VolumeTrendPoint(
            timestamp_hour=slot_label,
            detection_count=base_count,
            unique_plates=unique_count
        ))
        
    return trends

@router.get("/hotspots", response_model=list[HotspotIntersection])
def get_hotspot_intersections(db: Session = Depends(get_db)):
    cameras = db.query(Camera).limit(6).all()
    hotspots = []
    
    for cam in cameras:
        det_count = db.query(Detection).filter(Detection.camera_id == cam.id).count()
        congestion = round(min(0.95, det_count / 100.0), 2) if det_count > 0 else 0.0
        hotspots.append(HotspotIntersection(
            camera_id=cam.id,
            designation=cam.designation,
            location_address=cam.location_address,
            detection_count=det_count,
            congestion_index=congestion
        ))
        
    return sorted(hotspots, key=lambda x: x.detection_count, reverse=True)
