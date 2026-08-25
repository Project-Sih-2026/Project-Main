from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True)  # e.g., CAM-022
    name = Column(String, nullable=False)              # e.g., CAM-022 (Primary Node)
    designation = Column(String, nullable=False)       # e.g., Intersection B-Alpha
    district = Column(String, default="Central District")
    sector = Column(String, default="Sector 7")
    location_address = Column(String, nullable=False)  # e.g., Central Ave · Intersection B-Alpha
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    direction = Column(String, default="Northbound")
    stream_url = Column(String, nullable=True)
    resolution = Column(String, default="1080p @ 60fps")
    status = Column(String, default="nominal")         # nominal, scanning, standby, degraded, offline
    throughput_mbps = Column(Float, default=4.2)
    uptime_str = Column(String, default="14d 6h 22m")
    ping_ms = Column(Integer, default=18)
    last_heartbeat = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CameraTelemetry(Base):
    __tablename__ = "camera_telemetry"

    id = Column(String, primary_key=True, index=True)
    camera_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    status = Column(String, default="nominal")
    throughput_mbps = Column(Float, default=4.2)
    ping_ms = Column(Integer, default=18)
    frame_rate = Column(Float, default=30.0)
    drop_rate_pct = Column(Float, default=0.0)
