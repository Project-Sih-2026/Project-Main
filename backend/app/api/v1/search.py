from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.models.user import User
from app.models.detection import Detection
from app.models.camera import Camera
from app.schemas.detection import DetectionResponse
from app.services.normalization import normalize_plate
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/search", tags=["Vehicle Search"])

class AdvancedSearchRequest(BaseModel):
    query: str | None = None
    camera_id: str | None = None
    sector: str | None = None
    min_confidence: float = 0.5
    review_status: str | None = None
    has_alert: bool | None = None
    vehicle_type: str | None = None
    limit: int = 50

@router.get("/plates", response_model=list[DetectionResponse])
def quick_plate_search(
    q: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    norm = normalize_plate(q)
    results = db.query(Detection).filter(
        (Detection.normalized_plate_text.ilike(f"%{norm}%")) |
        (Detection.raw_plate_text.ilike(f"%{q}%")) |
        (Detection.corrected_plate_text.ilike(f"%{norm}%"))
    ).order_by(Detection.timestamp.desc()).limit(50).all()
    
    # Audit log sensitive search query
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="PLATE_SEARCH",
        target_type="SEARCH",
        target_id=norm,
        details={"query_raw": q, "normalized": norm, "results_count": len(results)}
    )
    
    return results

@router.post("/advanced", response_model=list[DetectionResponse])
def advanced_plate_search(
    criteria: AdvancedSearchRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Detection)
    
    if criteria.query:
        norm = normalize_plate(criteria.query)
        query = query.filter(
            (Detection.normalized_plate_text.ilike(f"%{norm}%")) |
            (Detection.raw_plate_text.ilike(f"%{criteria.query}%")) |
            (Detection.corrected_plate_text.ilike(f"%{norm}%"))
        )
    if criteria.camera_id and criteria.camera_id != "all":
        query = query.filter(Detection.camera_id == criteria.camera_id)
    if criteria.sector and criteria.sector != "all":
        cam_ids = [c.id for c in db.query(Camera).filter(Camera.sector == criteria.sector).all()]
        query = query.filter(Detection.camera_id.in_(cam_ids))
    if criteria.min_confidence > 0:
        query = query.filter(Detection.confidence_score >= criteria.min_confidence)
    if criteria.review_status and criteria.review_status != "all":
        query = query.filter(Detection.review_status == criteria.review_status)
    if criteria.has_alert is not None:
        query = query.filter(Detection.has_alert == criteria.has_alert)
    if criteria.vehicle_type and criteria.vehicle_type != "all":
        query = query.filter(Detection.vehicle_type == criteria.vehicle_type)
        
    results = query.order_by(Detection.timestamp.desc()).limit(criteria.limit).all()
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="ADVANCED_SEARCH",
        target_type="SEARCH",
        details=criteria.model_dump()
    )
    
    return results
