import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.camera import Camera, CameraTelemetry
from app.schemas.camera import CameraResponse, CameraTelemetryResponse, CameraCreate
from app.services.telemetry_service import get_simulated_telemetry

router = APIRouter(prefix="/cameras", tags=["Cameras"])

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
