from datetime import datetime
from pydantic import BaseModel, ConfigDict

class WatchlistBase(BaseModel):
    normalized_plate: str
    category: str  # STOLEN_VEHICLE_REPORT, WARRANT_ADVISORY, TRAFFIC_VIOLATION, AMBER_ALERT_ASSIST, GENERAL_INVESTIGATION
    severity: str = "HIGH"
    description: str
    case_number: str | None = None
    is_active: bool = True

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistResponse(WatchlistBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

class AlertActionCreate(BaseModel):
    action: str  # ACKNOWLEDGE, ASSIGN, ESCALATE, ANNOTATE, RESOLVE, DISMISS
    assigned_to: str | None = None
    notes: str | None = None
    reason: str | None = None  # Mandatory if action == DISMISS

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    detection_id: str
    camera_id: str
    watchlist_id: str | None
    plate_matched: str
    category: str
    severity: str
    status: str
    assigned_to: str | None
    dismissal_reason: str | None
    resolution_notes: str | None
    created_at: datetime
    updated_at: datetime

class AlertDetailResponse(AlertResponse):
    detection: dict | None = None
    camera: dict | None = None
    actions: list[dict] = []
