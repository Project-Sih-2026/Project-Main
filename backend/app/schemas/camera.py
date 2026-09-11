from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CameraBase(BaseModel):
    id: str
    name: str
    designation: str
    district: str = "Central District"
    sector: str = "Sector 7"
    location_address: str
    latitude: float
    longitude: float
    direction: str = "Northbound"
    stream_url: str | None = None
    resolution: str = "1080p @ 60fps"
    status: str = "nominal"

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: str | None = None
    designation: str | None = None
    district: str | None = None
    sector: str | None = None
    location_address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    direction: str | None = None
    stream_url: str | None = None
    status: str | None = None

class CameraTelemetryResponse(BaseModel):
    camera_id: str
    designation: str
    latitude: float
    longitude: float
    status: str
    throughput_mbps: float
    uptime_str: str
    ping_ms: int
    last_heartbeat: datetime

class CameraResponse(CameraBase):
    model_config = ConfigDict(from_attributes=True)

    throughput_mbps: float
    uptime_str: str
    ping_ms: int
    last_heartbeat: datetime
    created_at: datetime
