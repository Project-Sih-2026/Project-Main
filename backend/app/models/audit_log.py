from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    username = Column(String, index=True, nullable=False)
    action_type = Column(String, index=True, nullable=False)  # AUTH_LOGIN, PLATE_SEARCH, OCR_CORRECTION, ALERT_ACTION, DATA_EXPORT, RETENTION_PURGE, CAMERA_CONFIG
    target_type = Column(String, nullable=True)               # DETECTION, ALERT, CAMERA, EXPORT, SEARCH
    target_id = Column(String, nullable=True)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
