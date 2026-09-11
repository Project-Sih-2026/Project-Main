from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    username: str
    action_type: str
    target_type: str | None
    target_id: str | None
    details_json: str | None
    ip_address: str
    created_at: datetime

class SystemHealthResponse(BaseModel):
    connectivity_status: str     # OPTIMAL, DEGRADED, CRITICAL
    network_ping_ms: int
    active_feed_count: int
    worker_queue_backlog: int
    ocr_failure_rate_pct: float
    delayed_sources_count: int
    last_sync_timestamp: datetime
    db_status: str
