import uuid
import cv2
import numpy as np
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_optional, require_role
from app.models.user import User
from app.models.detection import Detection
from app.models.ocr_correction import OCRCorrection
from app.schemas.detection import (
    DetectionResponse, 
    OCRCorrectionCreate, 
    OCRCorrectionResponse,
    DetectionIngestItem,
    DetectionIngestBatchRequest,
    DetectionUpdate
)
from app.services.normalization import normalize_plate
from app.services.alert_engine import check_and_generate_alerts
from app.services.ai_pipeline import simulate_pipeline_inference, get_ai_pipeline
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

@router.post("/ingest", response_model=DetectionResponse)
def ingest_detection(
    item: DetectionIngestItem,
    db: Session = Depends(get_db)
):
    """
    Ingests a single license plate detection from an AI model or CCTV edge stream.
    """
    raw = item.plate_text.strip()
    norm = normalize_plate(raw)
    if not norm:
        raise HTTPException(status_code=400, detail="Invalid plate text provided")
        
    det_id = f"det-{uuid.uuid4().hex[:10]}"
    dt = item.timestamp or datetime.now(timezone.utc)
    
    detection = Detection(
        id=det_id,
        camera_id=item.camera_id,
        timestamp=dt,
        raw_plate_text=raw,
        normalized_plate_text=norm,
        confidence_score=item.confidence_score,
        ocr_confidence=item.ocr_confidence,
        model_version=item.model_version,
        vehicle_type=item.vehicle_type,
        bounding_box=item.bounding_box,
        plate_bounding_box=item.plate_bounding_box,
        evidence_image_uri=item.evidence_image_uri or f"/static/frames/{item.camera_id.lower()}_mock.jpg",
        plate_crop_uri=item.plate_crop_uri or f"/static/crops/crop_{raw.lower()[:6]}.jpg",
        processing_status="COMPLETED"
    )
    
    db.add(detection)
    db.commit()
    db.refresh(detection)
    
    check_and_generate_alerts(db, detection)
    db.refresh(detection)
    
    return detection

@router.post("/ingest/batch", response_model=list[DetectionResponse])
def ingest_batch_detections(
    batch: DetectionIngestBatchRequest,
    db: Session = Depends(get_db)
):
    """
    Ingests 1 or more license plate detections concurrently (e.g. multi-vehicle frame).
    """
    results = []
    for item in batch.detections:
        raw = item.plate_text.strip()
        norm = normalize_plate(raw)
        if not norm:
            continue
            
        det_id = f"det-{uuid.uuid4().hex[:10]}"
        dt = item.timestamp or datetime.now(timezone.utc)
        
        detection = Detection(
            id=det_id,
            camera_id=item.camera_id,
            timestamp=dt,
            raw_plate_text=raw,
            normalized_plate_text=norm,
            confidence_score=item.confidence_score,
            ocr_confidence=item.ocr_confidence,
            model_version=item.model_version,
            vehicle_type=item.vehicle_type,
            bounding_box=item.bounding_box,
            plate_bounding_box=item.plate_bounding_box,
            evidence_image_uri=item.evidence_image_uri or f"/static/frames/{item.camera_id.lower()}_mock.jpg",
            plate_crop_uri=item.plate_crop_uri or f"/static/crops/crop_{raw.lower()[:6]}.jpg",
            processing_status="COMPLETED"
        )
        
        db.add(detection)
        db.commit()
        db.refresh(detection)
        
        check_and_generate_alerts(db, detection)
        db.refresh(detection)
        results.append(detection)
        
    return results

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

@router.get("/ai/model-info")
def get_ai_model_metadata():
    """
    Returns YOLOv8 AI Model metadata, loaded weights path, and class labels (81 classes including number_plate).
    """
    pipeline = get_ai_pipeline()
    return pipeline.get_model_info()

def parse_observation_timestamp(ts_val: str | datetime | None) -> datetime:
    if not ts_val:
        return datetime.now(timezone.utc)
    if isinstance(ts_val, datetime):
        if ts_val.tzinfo is None:
            return ts_val.replace(tzinfo=timezone.utc)
        return ts_val
    ts_str = str(ts_val).strip()
    if not ts_str:
        return datetime.now(timezone.utc)
    try:
        if ts_str.endswith("Z"):
            ts_str = ts_str[:-1] + "+00:00"
        dt = datetime.fromisoformat(ts_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        pass
    for fmt in (
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(ts_str, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return datetime.now(timezone.utc)

@router.post("/infer-frame", response_model=DetectionResponse)
async def infer_uploaded_frame(
    request: Request,
    camera_id: str | None = Form(None),
    file: UploadFile = File(...),
    custom_plate: str | None = Form(None),
    owner_name: str | None = Form(None),
    timestamp: str | None = Form(None),
    db: Session = Depends(get_db)
):
    """
    Directly infers objects and license plates on an uploaded CCTV frame using YOLO best.pt model.
    """
    effective_cam = camera_id or request.query_params.get("camera_id") or "CAM-KN-01"
    effective_plate = custom_plate or request.query_params.get("custom_plate") or None
    effective_owner = owner_name or request.query_params.get("owner_name") or None
    effective_time = timestamp or request.query_params.get("timestamp") or None
    obs_datetime = parse_observation_timestamp(effective_time)

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image file")
        
    pipeline = get_ai_pipeline()
    res = pipeline.infer_frame(frame, camera_id=effective_cam, custom_raw_plate=effective_plate)
    
    det_id = f"det-{uuid.uuid4().hex[:10]}"
    detection = Detection(
        id=det_id,
        camera_id=res["camera_id"],
        timestamp=obs_datetime,
        raw_plate_text=res["raw_plate_text"],
        normalized_plate_text=res["normalized_plate_text"],
        confidence_score=res["confidence_score"],
        ocr_confidence=res["ocr_confidence"],
        model_version=res["model_version"],
        vehicle_type=res["vehicle_type"],
        owner_name=effective_owner or "",
        bounding_box=res["bounding_box"],
        plate_bounding_box=res["plate_bounding_box"],
        evidence_image_uri=res["evidence_image_uri"],
        plate_crop_uri=res["plate_crop_uri"],
        processing_status=res["processing_status"]
    )
    
    db.add(detection)
    db.commit()
    db.refresh(detection)
    
    check_and_generate_alerts(db, detection)
    db.refresh(detection)
    
    return detection


@router.post("/upload-route")
async def infer_uploaded_frame_with_route(
    request: Request,
    camera_id: str | None = Form(None),
    custom_plate: str | None = Form(None),
    owner_name: str | None = Form(None),
    timestamp: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Infers objects and license plate from uploaded image for chosen CCTV camera,
    saves detection with accurate observation timestamp, checks watchlists, and returns detection + full vehicle journey route.
    """
    from app.api.v1.routes import get_vehicle_history
    
    effective_cam = camera_id or request.query_params.get("camera_id") or "CAM-KN-01"
    effective_plate = custom_plate or request.query_params.get("custom_plate") or None
    effective_owner = owner_name or request.query_params.get("owner_name") or None
    effective_time = timestamp or request.query_params.get("timestamp") or None
    obs_datetime = parse_observation_timestamp(effective_time)

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image file")
        
    pipeline = get_ai_pipeline()
    res = pipeline.infer_frame(frame, camera_id=effective_cam, custom_raw_plate=effective_plate)

    entries = res.get("entries", [res])
    results_list = []

    # Parse owner names if comma-separated
    owner_names_list = []
    if effective_owner:
        owner_names_list = [on.strip() for on in effective_owner.split(",") if on.strip()]

    for idx, entry in enumerate(entries):
        det_id = f"det-{uuid.uuid4().hex[:10]}"
        o_name = owner_names_list[idx] if idx < len(owner_names_list) else (owner_names_list[0] if owner_names_list else "")

        det = Detection(
            id=det_id,
            camera_id=entry["camera_id"],
            timestamp=obs_datetime,
            raw_plate_text=entry["raw_plate_text"],
            normalized_plate_text=entry["normalized_plate_text"],
            confidence_score=entry["confidence_score"],
            ocr_confidence=entry["ocr_confidence"],
            model_version=entry["model_version"],
            vehicle_type=entry["vehicle_type"],
            owner_name=o_name,
            bounding_box=entry["bounding_box"],
            plate_bounding_box=entry["plate_bounding_box"],
            evidence_image_uri=entry["evidence_image_uri"],
            plate_crop_uri=entry["plate_crop_uri"],
            processing_status=entry["processing_status"]
        )
        db.add(det)
        db.commit()
        db.refresh(det)

        check_and_generate_alerts(db, det)
        db.refresh(det)

        # Query complete vehicle journey route
        journey = None
        try:
            journey = get_vehicle_history(plate=det.normalized_plate_text, db=db)
        except Exception:
            journey = None

        results_list.append({
            "detection": DetectionResponse.model_validate(det),
            "journey": journey
        })

    primary = results_list[0]
    return {
        "detection": primary["detection"],
        "journey": primary["journey"],
        "detections": results_list,
        "count": len(results_list)
    }

@router.patch("/{detection_id}", response_model=DetectionResponse)
def update_detection(
    detection_id: str,
    payload: DetectionUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates editable fields of a stored detection record (e.g. Owner/Vehicle Name, Vehicle Type, Plate, Camera, Timestamp).
    """
    det = db.query(Detection).filter(Detection.id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection record not found")
    if payload.owner_name is not None:
        det.owner_name = payload.owner_name
    if payload.vehicle_type is not None:
        det.vehicle_type = payload.vehicle_type
    if payload.normalized_plate_text is not None:
        det.normalized_plate_text = normalize_plate(payload.normalized_plate_text)
    if payload.camera_id is not None:
        det.camera_id = payload.camera_id
    if payload.timestamp is not None:
        det.timestamp = parse_observation_timestamp(payload.timestamp)
    db.commit()
    db.refresh(det)
    return det

@router.delete("/purge-all")
def purge_all_detections(db: Session = Depends(get_db)):
    """
    Purges all detection records, associated alerts, and OCR corrections.
    """
    from app.models.alert import Alert, AlertAction
    db.query(OCRCorrection).delete()
    db.query(AlertAction).delete()
    db.query(Alert).delete()
    db.query(Detection).delete()
    db.commit()
    return {"status": "success", "message": "All detections and related alerts purged successfully."}

@router.delete("/{detection_id}")
def delete_detection(detection_id: str, db: Session = Depends(get_db)):
    """
    Deletes a single detection record by ID.
    """
    from app.models.alert import Alert, AlertAction
    db.query(OCRCorrection).filter(OCRCorrection.detection_id == detection_id).delete()
    alerts = db.query(Alert).filter(Alert.detection_id == detection_id).all()
    for a in alerts:
        db.query(AlertAction).filter(AlertAction.alert_id == a.id).delete()
        db.delete(a)
    det = db.query(Detection).filter(Detection.id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection record not found")
    db.delete(det)
    db.commit()
    return {"status": "success", "message": f"Detection {detection_id} deleted."}

