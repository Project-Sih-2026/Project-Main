from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from app.core.database import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(String, primary_key=True, index=True)
    camera_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Dual-storage requirement: raw vs normalized plate
    raw_plate_text = Column(String, nullable=False, index=True)
    normalized_plate_text = Column(String, nullable=False, index=True)
    
    confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0
    ocr_confidence = Column(Float, default=0.92)
    model_version = Column(String, default="YOLOv8-ANPR-v2.4")
    
    vehicle_type = Column(String, default="Sedan")     # Sedan, SUV, Commercial Truck, Transit Van, Motorcycle
    owner_name = Column(String, nullable=True, default="")
    bounding_box = Column(Text, nullable=True)          # JSON array [ymin, xmin, ymax, xmax]
    plate_bounding_box = Column(Text, nullable=True)
    
    evidence_image_uri = Column(String, nullable=False)
    plate_crop_uri = Column(String, nullable=True)
    
    processing_status = Column(String, default="COMPLETED")  # COMPLETED, REVIEW_REQUIRED, UNVERIFIED
    
    # Human verification fields (raw_plate_text remains immutable)
    is_corrected = Column(Boolean, default=False)
    corrected_plate_text = Column(String, nullable=True, index=True)
    review_status = Column(String, default="UNREVIEWED")    # UNREVIEWED, VERIFIED, CORRECTION_APPLIED
    
    # Alert linking
    has_alert = Column(Boolean, default=False)
    alert_type = Column(String, nullable=True)
