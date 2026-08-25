from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from app.core.database import Base

class RetentionPolicy(Base):
    __tablename__ = "retention_policies"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    data_type = Column(String, nullable=False)  # RAW_VIDEO_EVIDENCE, DETECTION_METADATA, AUDIT_LOGS
    retention_days = Column(Integer, default=90)
    auto_purge_enabled = Column(Boolean, default=False)
    last_purged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
