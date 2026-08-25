from datetime import datetime
from pydantic import BaseModel

class DetectionBase(BaseModel):
    camera_id: str
    raw_plate_text: str
    normalized_plate_text: str
    confidence_score: float
    ocr_confidence: float = 0.92
    model_version: str = "YOLOv8-ANPR-v2.4"
    vehicle_type: str = "Sedan"
    bounding_box: str | None = None
    plate_bounding_box: str | None = None
    evidence_image_uri: str
    plate_crop_uri: str | None = None
    processing_status: str = "COMPLETED"

class DetectionCreate(DetectionBase):
    pass

class DetectionResponse(DetectionBase):
    id: str
    timestamp: datetime
    is_corrected: bool = False
    corrected_plate_text: str | None = None
    review_status: str = "UNREVIEWED"
    has_alert: bool = False
    alert_type: str | None = None

    class Config:
        from_attributes = True

class OCRCorrectionCreate(BaseModel):
    corrected_plate: str
    reason: str  # MISREAD_CHARACTER, PARTIAL_OBSCURATION, GLARE_REFLECTION, PLATE_DAMAGE, HEURISTIC_OVERRIDE, OTHER
    notes: str | None = None

class OCRCorrectionResponse(BaseModel):
    id: str
    detection_id: str
    original_ocr: str
    corrected_plate: str
    reviewer_id: str
    reviewer_username: str
    reason: str
    notes: str | None
    revision_number: int
    created_at: datetime

    class Config:
        from_attributes = True
