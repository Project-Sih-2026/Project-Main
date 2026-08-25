from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.detection import Detection
from app.models.camera import Camera
from app.schemas.analytics import VehicleJourneyResponse, VehicleHistoryStop
from app.services.normalization import normalize_plate

router = APIRouter(prefix="/vehicles", tags=["Vehicle History & GIS Routes"])

@router.get("/{plate}/history", response_model=VehicleJourneyResponse)
def get_vehicle_history(plate: str, db: Session = Depends(get_db)):
    """
    Returns ordered camera observation sequence for a vehicle plate.
    """
    norm = normalize_plate(plate)
    if not norm:
        raise HTTPException(status_code=400, detail="Invalid vehicle plate requested")
        
    detections = db.query(Detection).filter(
        (Detection.normalized_plate_text == norm) |
        (Detection.corrected_plate_text == norm)
    ).order_by(Detection.timestamp.asc()).all()
    
    if not detections:
        # Check partial match if exact match not found
        detections = db.query(Detection).filter(
            Detection.normalized_plate_text.ilike(f"%{norm}%")
        ).order_by(Detection.timestamp.asc()).all()
        
    if not detections:
        raise HTTPException(status_code=404, detail=f"No camera observations found for plate: {plate}")
        
    camera_ids = [d.camera_id for d in detections]
    cameras_map = {c.id: c for c in db.query(Camera).filter(Camera.id.in_(camera_ids)).all()}
    
    stops: list[VehicleHistoryStop] = []
    for idx, d in enumerate(detections, 1):
        cam = cameras_map.get(d.camera_id)
        if not cam:
            continue
        stops.append(VehicleHistoryStop(
            stop_number=idx,
            camera_id=cam.id,
            camera_designation=cam.designation,
            location_address=cam.location_address,
            latitude=cam.latitude,
            longitude=cam.longitude,
            timestamp=d.timestamp,
            raw_plate_text=d.raw_plate_text,
            confidence_score=d.confidence_score,
            evidence_image_uri=d.evidence_image_uri,
            status="Verified Match" if d.is_corrected else ("Possible Match" if d.has_alert else "Observation")
        ))
        
    return VehicleJourneyResponse(
        plate=norm,
        total_observations=len(stops),
        first_seen=detections[0].timestamp,
        last_seen=detections[-1].timestamp,
        observation_stops=stops,
        disclaimer="Discrete camera observation sequence. Does not represent continuous GPS tracking."
    )
