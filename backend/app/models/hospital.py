from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    hospital_type = Column(String, default="General")
    district = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_phone = Column(String, nullable=True)
    total_beds = Column(Integer, default=100)
    has_trauma_center = Column(String, default="YES")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
