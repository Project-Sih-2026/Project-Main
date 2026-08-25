from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.core.database import Base

class OCRCorrection(Base):
    __tablename__ = "ocr_corrections"

    id = Column(String, primary_key=True, index=True)
    detection_id = Column(String, index=True, nullable=False)
    original_ocr = Column(String, nullable=False)
    corrected_plate = Column(String, nullable=False)
    reviewer_id = Column(String, nullable=False)
    reviewer_username = Column(String, nullable=False)
    
    # Mandatory reason enum per PRD REQ-OCR-REV-02
    reason = Column(String, nullable=False)  # MISREAD_CHARACTER, PARTIAL_OBSCURATION, GLARE_REFLECTION, PLATE_DAMAGE, HEURISTIC_OVERRIDE, OTHER
    notes = Column(Text, nullable=True)
    
    revision_number = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
