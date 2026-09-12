import math
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.detection import Detection
from app.models.camera import Camera
from app.schemas.analytics import VehicleJourneyResponse, VehicleHistoryStop
from app.services.normalization import normalize_plate

from pydantic import BaseModel, Field
from app.services.speed_trap_service import analyze_inter_camera_transit

router = APIRouter(prefix="/vehicles", tags=["Vehicle History & GIS Routes"])

class SpeedTrapRequest(BaseModel):
    cam_a_id: str = Field(..., description="Starting camera ID, e.g. CAM-KN-02")
    time_a: datetime = Field(..., description="Timestamp at first camera")
    cam_b_id: str = Field(..., description="Exit camera ID, e.g. CAM-GN-08")
    time_b: datetime = Field(..., description="Timestamp at second camera")
    plate: str = Field("DL-01-AB-1234", description="Vehicle registration plate")
    speed_limit_kmh: float = Field(50.0, description="Corridor speed limit in km/h")

@router.post("/speed-trap-analysis")
def perform_speed_trap_analysis(req: SpeedTrapRequest, db: Session = Depends(get_db)):
    """
    Computes shortest corridor distance, elapsed transit duration, and point-to-point average speed.
    Automatically identifies speeding violations and cloned plate fraud anomalies.
    """
    return analyze_inter_camera_transit(
        cam_a_id=req.cam_a_id,
        time_a=req.time_a,
        cam_b_id=req.cam_b_id,
        time_b=req.time_b,
        plate=req.plate,
        speed_limit_kmh=req.speed_limit_kmh,
        db=db
    )

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.get("/{plate}/history", response_model=VehicleJourneyResponse)
def get_vehicle_history(plate: str, db: Session = Depends(get_db)):
    """
    Returns ordered camera observation sequence for a vehicle plate with distance, duration, and transit metrics.
    """
    norm = normalize_plate(plate)
    if not norm:
        raise HTTPException(status_code=400, detail="Invalid vehicle plate requested")
        
    detections = db.query(Detection).filter(
        (Detection.normalized_plate_text == norm) |
        (Detection.corrected_plate_text == norm)
    ).order_by(Detection.timestamp.asc()).all()
    
    if not detections and len(norm) >= 6:
        # Check partial match only if search query is sufficiently specific
        detections = db.query(Detection).filter(
            Detection.normalized_plate_text.ilike(f"%{norm}%")
        ).order_by(Detection.timestamp.asc()).all()
        
    if not detections:
        raise HTTPException(status_code=404, detail=f"No camera observations found for plate: {plate}")
        
    camera_ids = [d.camera_id for d in detections]
    cameras_map = {c.id: c for c in db.query(Camera).filter(Camera.id.in_(camera_ids)).all()}
    
    stops: list[VehicleHistoryStop] = []
    total_dist = 0.0
    prev_stop: VehicleHistoryStop | None = None
    
    for idx, d in enumerate(detections, 1):
        cam = cameras_map.get(d.camera_id)
        cam_designation = cam.designation if cam else f"Sensor Node {d.camera_id}"
        cam_address = cam.location_address if cam else "Municipal Traffic Sensor Point"
        cam_lat = cam.latitude if cam else (28.6139 + (idx * 0.004))
        cam_lng = cam.longitude if cam else (77.2090 + (idx * 0.004))
            
        dist_from_prev = None
        duration_mins = None
        speed_kmh = None
        
        if prev_stop:
            dist = haversine_distance_km(prev_stop.latitude, prev_stop.longitude, cam_lat, cam_lng)
            dist_from_prev = dist
            total_dist += dist
            
            # Calculate time difference in minutes
            dt_seconds = abs((d.timestamp - prev_stop.timestamp).total_seconds())
            duration_mins = round(dt_seconds / 60.0, 1)
            
            if duration_mins > 0 and dist > 0:
                speed_kmh = round((dist / (dt_seconds / 3600.0)), 1)
                
        stop = VehicleHistoryStop(
            stop_number=idx,
            camera_id=d.camera_id,
            camera_designation=cam_designation,
            location_address=cam_address,
            latitude=cam_lat,
            longitude=cam_lng,
            timestamp=d.timestamp,
            raw_plate_text=d.raw_plate_text,
            confidence_score=d.confidence_score,
            evidence_image_uri=d.evidence_image_uri,
            status="Verified Match" if d.is_corrected else ("Possible Match" if d.has_alert else "Observation"),
            distance_from_prev_km=dist_from_prev,
            duration_mins_from_prev=duration_mins,
            estimated_speed_kmh=speed_kmh
        )
        stops.append(stop)
        prev_stop = stop

    total_duration_mins = None
    average_speed_kmh = None
    if len(detections) > 1:
        total_dt_sec = abs((detections[-1].timestamp - detections[0].timestamp).total_seconds())
        total_duration_mins = round(total_dt_sec / 60.0, 1)
        if total_duration_mins > 0 and total_dist > 0:
            average_speed_kmh = round((total_dist / (total_dt_sec / 3600.0)), 1)
        
    return VehicleJourneyResponse(
        plate=norm,
        total_observations=len(stops),
        first_seen=detections[0].timestamp,
        last_seen=detections[-1].timestamp,
        total_distance_km=round(total_dist, 2),
        total_duration_mins=total_duration_mins,
        average_speed_kmh=average_speed_kmh,
        observation_stops=stops,
        disclaimer="Discrete camera observation sequence. Does not represent continuous GPS tracking."
    )
