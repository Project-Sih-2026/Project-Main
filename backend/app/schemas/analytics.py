from datetime import datetime
from pydantic import BaseModel

class AnalyticsKPISummary(BaseModel):
    total_detection_events: int
    unique_normalized_plates: int
    active_cameras_count: int
    review_required_count: int
    active_alerts_count: int
    system_health_status: str

class VolumeTrendPoint(BaseModel):
    timestamp_hour: str
    detection_count: int
    unique_plates: int

class HotspotIntersection(BaseModel):
    camera_id: str
    designation: str
    location_address: str
    detection_count: int
    congestion_index: float

class VehicleHistoryStop(BaseModel):
    stop_number: int
    camera_id: str
    camera_designation: str
    location_address: str
    latitude: float
    longitude: float
    timestamp: datetime
    raw_plate_text: str
    confidence_score: float
    evidence_image_uri: str
    status: str

class VehicleJourneyResponse(BaseModel):
    plate: str
    total_observations: int
    first_seen: datetime
    last_seen: datetime
    observation_stops: list[VehicleHistoryStop]
    disclaimer: str = "Discrete camera observation sequence. Does not represent continuous GPS tracking."
