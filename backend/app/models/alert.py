from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    detection_id = Column(String, index=True, nullable=False)
    camera_id = Column(String, index=True, nullable=False)
    watchlist_id = Column(String, index=True, nullable=True)
    plate_matched = Column(String, index=True, nullable=False)
    
    category = Column(String, default="GENERAL_INVESTIGATION")
    severity = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    
    # State Machine: NEW -> ACKNOWLEDGED -> ASSIGNED -> ESCALATED -> RESOLVED / DISMISSED
    status = Column(String, default="NEW", index=True)
    assigned_to = Column(String, nullable=True)
    
    # Mandatory reason if dismissed
    dismissal_reason = Column(String, nullable=True)  # FALSE_POSITIVE_OCR, UNMATCHED_CHARACTER, OUTDATED_ALERT, DUPLICATE_ENTRY, OTHER
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AlertAction(Base):
    __tablename__ = "alert_actions"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, index=True, nullable=False)
    user_id = Column(String, nullable=False)
    username = Column(String, nullable=False)
    action = Column(String, nullable=False)  # ACKNOWLEDGE, ASSIGN, ESCALATE, ANNOTATE, RESOLVE, DISMISS
    from_status = Column(String, nullable=False)
    to_status = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
