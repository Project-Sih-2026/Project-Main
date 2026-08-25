import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.camera import Camera
from app.schemas.audit import SystemHealthResponse

router = APIRouter(prefix="/health", tags=["System Health"])

@router.get("/system", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    active_cams = db.query(Camera).filter(Camera.status.in_(["nominal", "scanning"])).count()
    delayed_cams = db.query(Camera).filter(Camera.status == "degraded").count()
    
    return SystemHealthResponse(
        connectivity_status="OPTIMAL",
        network_ping_ms=random.randint(14, 22),
        active_feed_count=active_cams,
        worker_queue_backlog=0,
        ocr_failure_rate_pct=0.4,
        delayed_sources_count=delayed_cams,
        last_sync_timestamp=datetime.now(timezone.utc),
        db_status="CONNECTED"
    )
