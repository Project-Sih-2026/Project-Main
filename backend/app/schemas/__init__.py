from app.schemas.user import UserCreate, UserResponse, TokenResponse, LoginRequest
from app.schemas.camera import CameraCreate, CameraUpdate, CameraResponse, CameraTelemetryResponse
from app.schemas.detection import DetectionCreate, DetectionResponse, OCRCorrectionCreate, OCRCorrectionResponse
from app.schemas.alert import WatchlistCreate, WatchlistResponse, AlertResponse, AlertDetailResponse, AlertActionCreate
from app.schemas.analytics import AnalyticsKPISummary, VolumeTrendPoint, HotspotIntersection, VehicleJourneyResponse
from app.schemas.audit import AuditLogResponse, SystemHealthResponse

__all__ = [
    "UserCreate", "UserResponse", "TokenResponse", "LoginRequest",
    "CameraCreate", "CameraUpdate", "CameraResponse", "CameraTelemetryResponse",
    "DetectionCreate", "DetectionResponse", "OCRCorrectionCreate", "OCRCorrectionResponse",
    "WatchlistCreate", "WatchlistResponse", "AlertResponse", "AlertDetailResponse", "AlertActionCreate",
    "AnalyticsKPISummary", "VolumeTrendPoint", "HotspotIntersection", "VehicleJourneyResponse",
    "AuditLogResponse", "SystemHealthResponse"
]
