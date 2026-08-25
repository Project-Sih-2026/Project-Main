from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.retention_policy import RetentionPolicy
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/audit", tags=["Audit & Governance"])

@router.get("/logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    action_type: str | None = None,
    username: str | None = None,
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_role(["ROLE_ADMIN", "ROLE_OPERATOR"])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action_type and action_type != "all":
        query = query.filter(AuditLog.action_type == action_type)
    if username:
        query = query.filter(AuditLog.username.ilike(f"%{username}%"))
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()

@router.get("/retention")
def get_retention_policies(
    current_user: User = Depends(require_role(["ROLE_ADMIN"])),
    db: Session = Depends(get_db)
):
    policies = db.query(RetentionPolicy).all()
    return policies

@router.post("/retention/purge")
def trigger_retention_purge(
    policy_id: str,
    current_user: User = Depends(require_role(["ROLE_ADMIN"])),
    db: Session = Depends(get_db)
):
    policy = db.query(RetentionPolicy).filter(RetentionPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Retention policy not found")
        
    policy.last_purged_at = datetime.now(timezone.utc)
    db.commit()
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="RETENTION_PURGE",
        target_type="POLICY",
        target_id=policy.id,
        details={"policy_name": policy.name, "days": policy.retention_days}
    )
    return {"status": "success", "message": f"Purge executed for policy: {policy.name}"}
