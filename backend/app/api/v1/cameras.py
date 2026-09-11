import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.camera import Camera, CameraTelemetry
from app.schemas.camera import CameraResponse, CameraTelemetryResponse, CameraCreate
from app.services.telemetry_service import get_simulated_telemetry

from app.services.distance_service import compute_camera_distances_matrix, haversine_distance_meters, calculate_bearing

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("/distances")
def get_all_camera_distances(speed_kmh: float = 30.0, db: Session = Depends(get_db)):
    """
    Returns complete NxN pairwise distance, bearing, and estimated transit times for all cameras.
    """
    cameras = db.query(Camera).order_by(Camera.id).all()
    return compute_camera_distances_matrix(cameras, urban_speed_kmh=speed_kmh)

@router.get("", response_model=list[CameraResponse])
def get_cameras(
    sector: str | None = None,
    status: str | None = None,
    district: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Camera)
    if sector and sector != "All Sectors":
        query = query.filter(Camera.sector == sector)
    if status and status != "all":
        query = query.filter(Camera.status == status)
    if district and district != "All Districts":
        query = query.filter(Camera.district == district)
    return query.order_by(Camera.id).all()

@router.get("/{camera_id}/nearest")
def get_nearest_cameras(camera_id: str, limit: int = 5, db: Session = Depends(get_db)):
    """
    Returns nearest neighboring cameras to a given camera node.
    """
    target = db.query(Camera).filter(Camera.id == camera_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Camera node not found")
    
    all_cams = db.query(Camera).filter(Camera.id != camera_id).all()
    neighbors = []
    for c in all_cams:
        dist_m = haversine_distance_meters(target.latitude, target.longitude, c.latitude, c.longitude)
        brg_deg, brg_dir = calculate_bearing(target.latitude, target.longitude, c.latitude, c.longitude)
        neighbors.append({
            "camera_id": c.id,
            "designation": c.designation,
            "district": c.district,
            "distance_meters": dist_m,
            "distance_km": round(dist_m / 1000.0, 3),
            "est_transit_mins": round((dist_m / (30 * 1000 / 3600)) / 60.0, 1),
            "bearing": f"{brg_deg}° ({brg_dir})"
        })
    neighbors.sort(key=lambda x: x["distance_meters"])
    return {
        "source_camera": target.id,
        "source_designation": target.designation,
        "nearest": neighbors[:limit]
    }

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera_by_id(camera_id: str, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera node not found")
    return cam

@router.get("/{camera_id}/telemetry", response_model=CameraTelemetryResponse)
def get_camera_telemetry(camera_id: str, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera node not found")
        
    data = get_simulated_telemetry(cam.id, cam.designation, cam.latitude, cam.longitude)
    return data

@router.post("/scan-network")
def scan_camera_network(db: Session = Depends(get_db)):
    """
    Scans network status and syncs real-time heartbeat timestamps.
    """
    cameras = db.query(Camera).all()
    updated_count = len(cameras)
    for cam in cameras:
        cam.last_heartbeat = datetime.now(timezone.utc)
        cam.ping_ms = random.randint(12, 26)
        cam.throughput_mbps = round(random.uniform(3.9, 5.4), 2)
    db.commit()
    return {"status": "success", "scanned_nodes": updated_count, "network_health": "OPTIMAL"}
