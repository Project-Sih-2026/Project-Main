import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_optional, require_role
from app.models.user import User
from app.models.detection import Detection
from app.models.ocr_correction import OCRCorrection
from app.schemas.detection import DetectionResponse, OCRCorrectionCreate, OCRCorrectionResponse
from app.services.normalization import normalize_plate
from app.services.alert_engine import check_and_generate_alerts
from app.services.ai_pipeline import simulate_pipeline_inference
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/detections", tags=["Detections & OCR"])

@router.get("", response_model=list[DetectionResponse])
def get_detections(
    camera_id: str | None = None,
    plate: str | None = None,
    review_status: str | None = None,
    has_alert: bool | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Detection)
    if camera_id and camera_id != "all":
        query = query.filter(Detection.camera_id == camera_id)
    if plate:
        norm = normalize_plate(plate)
        query = query.filter(
            (Detection.normalized_plate_text.ilike(f"%{norm}%")) | 
            (Detection.raw_plate_text.ilike(f"%{plate}%")) |
            (Detection.corrected_plate_text.ilike(f"%{norm}%"))
        )
    if review_status and review_status != "all":
        query = query.filter(Detection.review_status == review_status)
    if has_alert is not None:
        query = query.filter(Detection.has_alert == has_alert)
        
    return query.order_by(Detection.timestamp.desc()).offset(offset).limit(limit).all()

@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection_by_id(detection_id: str, db: Session = Depends(get_db)):
    det = db.query(Detection).filter(Detection.id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection record not found")
    return det

@router.post("/simulate", response_model=DetectionResponse)
def simulate_detection(
    camera_id: str = "CAM-022",
    custom_plate: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Generates a realistic AI vehicle & plate detection event.
    """
    sim_data = simulate_pipeline_inference(camera_id, custom_plate)
    det_id = f"det-{uuid.uuid4().hex[:10]}"
    
    detection = Detection(
        id=det_id,
        camera_id=sim_data["camera_id"],
        timestamp=datetime.now(timezone.utc),
        raw_plate_text=sim_data["raw_plate_text"],
        normalized_plate_text=sim_data["normalized_plate_text"],
        confidence_score=sim_data["confidence_score"],
        ocr_confidence=sim_data["ocr_confidence"],
        model_version=sim_data["model_version"],
        vehicle_type=sim_data["vehicle_type"],
        bounding_box=sim_data["bounding_box"],
        plate_bounding_box=sim_data["plate_bounding_box"],
        evidence_image_uri=sim_data["evidence_image_uri"],
        plate_crop_uri=sim_data["plate_crop_uri"],
        processing_status=sim_data["processing_status"]
    )
    
    db.add(detection)
    db.commit()
    db.refresh(detection)
    
    # Check for blacklist/watchlist matches
    check_and_generate_alerts(db, detection)
    db.refresh(detection)
    
    return detection

@router.post("/{detection_id}/correct", response_model=OCRCorrectionResponse)
def submit_ocr_correction(
    detection_id: str,
    correction: OCRCorrectionCreate,
    current_user: User = Depends(require_role(["ROLE_OPERATOR", "ROLE_ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Applies human OCR correction preserving immutable raw OCR and logging full revision audit.
    """
    det = db.query(Detection).filter(Detection.id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection record not found")
        
    normalized_correction = normalize_plate(correction.corrected_plate)
    if not normalized_correction:
        raise HTTPException(status_code=400, detail="Invalid correction text provided")
        
    # Count previous revisions
    rev_count = db.query(OCRCorrection).filter(OCRCorrection.detection_id == detection_id).count()
    
    corr_record = OCRCorrection(
        id=f"ocr-corr-{uuid.uuid4().hex[:8]}",
        detection_id=det.id,
        original_ocr=det.raw_plate_text,
        corrected_plate=normalized_correction,
        reviewer_id=current_user.id,
        reviewer_username=current_user.username,
        reason=correction.reason,
        notes=correction.notes,
        revision_number=rev_count + 1,
        created_at=datetime.now(timezone.utc)
    )
    
    # Update detection reference (raw_plate_text is strictly preserved)
    det.is_corrected = True
    det.corrected_plate_text = normalized_correction
    det.review_status = "CORRECTION_APPLIED"
    
    db.add(corr_record)
    db.commit()
    db.refresh(corr_record)
    
    # Re-evaluate watchlist against corrected plate
    check_and_generate_alerts(db, det)
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="OCR_CORRECTION",
        target_type="DETECTION",
        target_id=det.id,
        details={
            "original_raw": det.raw_plate_text,
            "corrected": normalized_correction,
            "reason": correction.reason,
            "revision": corr_record.revision_number
        }
    )
    
    return corr_record

@router.get("/{detection_id}/revisions", response_model=list[OCRCorrectionResponse])
def get_ocr_revisions(detection_id: str, db: Session = Depends(get_db)):
    revisions = db.query(OCRCorrection).filter(
        OCRCorrection.detection_id == detection_id
    ).order_by(OCRCorrection.revision_number.asc()).all()
    return revisions
