import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_audit_event(
    db: Session,
    user_id: str,
    username: str,
    action_type: str,
    target_type: str | None = None,
    target_id: str | None = None,
    details: dict | None = None,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    """
    Creates an immutable audit log entry in the database.
    """
    details_str = json.dumps(details, default=str) if details else None
    
    audit_entry = AuditLog(
        id=f"aud-{uuid.uuid4().hex[:10]}",
        user_id=user_id,
        username=username,
        action_type=action_type,
        target_type=target_type,
        target_id=target_id,
        details_json=details_str,
        ip_address=ip_address,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
