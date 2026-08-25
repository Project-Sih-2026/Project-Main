from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.core.database import Base

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(String, primary_key=True, index=True)
    normalized_plate = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)  # STOLEN_VEHICLE_REPORT, WARRANT_ADVISORY, TRAFFIC_VIOLATION, AMBER_ALERT_ASSIST, GENERAL_INVESTIGATION
    severity = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    description = Column(Text, nullable=False)
    case_number = Column(String, nullable=True)
    created_by = Column(String, default="system_admin")
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
