import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_optional, require_role
from app.models.user import User
from app.models.alert import Alert, AlertAction
from app.models.watchlist import Watchlist
from app.models.detection import Detection
from app.models.camera import Camera
from app.schemas.alert import (
    AlertResponse, AlertDetailResponse, AlertActionCreate,
    WatchlistCreate, WatchlistResponse
)
from app.services.normalization import normalize_plate
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/alerts", tags=["Alerts & Watchlist Management"])

# --- Watchlist Registry Endpoints ---
@router.get("/watchlist", response_model=list[WatchlistResponse])
def get_watchlists(db: Session = Depends(get_db)):
    return db.query(Watchlist).order_by(Watchlist.created_at.desc()).all()

@router.post("/watchlist", response_model=WatchlistResponse)
def add_to_watchlist(
    item: WatchlistCreate,
    current_user: User = Depends(require_role(["ROLE_ADMIN", "ROLE_OPERATOR"])),
    db: Session = Depends(get_db)
):
    norm = normalize_plate(item.normalized_plate)
    if not norm:
        raise HTTPException(status_code=400, detail="Invalid license plate for watchlist")
        
    entry = Watchlist(
        id=f"wl-{uuid.uuid4().hex[:8]}",
        normalized_plate=norm,
        category=item.category,
        severity=item.severity,
        description=item.description,
        case_number=item.case_number,
        created_by=current_user.username,
        is_active=item.is_active,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="WATCHLIST_ADD",
        target_type="WATCHLIST",
        target_id=entry.id,
        details={"plate": norm, "category": entry.category, "severity": entry.severity}
    )
    return entry

@router.delete("/watchlist/{watchlist_id}")
def remove_from_watchlist(
    watchlist_id: str,
    current_user: User = Depends(require_role(["ROLE_ADMIN"])),
    db: Session = Depends(get_db)
):
    entry = db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
        
    entry.is_active = False
    db.commit()
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="WATCHLIST_DEACTIVATE",
        target_type="WATCHLIST",
        target_id=entry.id,
        details={"plate": entry.normalized_plate}
    )
    return {"status": "deactivated", "id": watchlist_id}

# --- Alerts Queue Endpoints ---
@router.get("", response_model=list[AlertResponse])
def get_alerts(
    status: str | None = None,
    severity: str | None = None,
    category: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status and status != "all":
        query = query.filter(Alert.status == status)
    if severity and severity != "all":
        query = query.filter(Alert.severity == severity)
    if category and category != "all":
        query = query.filter(Alert.category == category)
        
    return query.order_by(Alert.created_at.desc()).limit(limit).all()

@router.get("/{alert_id}", response_model=AlertDetailResponse)
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    alt = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alert record not found")
        
    det = db.query(Detection).filter(Detection.id == alt.detection_id).first()
    cam = db.query(Camera).filter(Camera.id == alt.camera_id).first()
    actions = db.query(AlertAction).filter(AlertAction.alert_id == alt.id).order_by(AlertAction.created_at.asc()).all()
    
    return AlertDetailResponse(
        id=alt.id,
        detection_id=alt.detection_id,
        camera_id=alt.camera_id,
        watchlist_id=alt.watchlist_id,
        plate_matched=alt.plate_matched,
        category=alt.category,
        severity=alt.severity,
        status=alt.status,
        assigned_to=alt.assigned_to,
        dismissal_reason=alt.dismissal_reason,
        resolution_notes=alt.resolution_notes,
        created_at=alt.created_at,
        updated_at=alt.updated_at,
        detection=det.__dict__ if det else None,
        camera=cam.__dict__ if cam else None,
        actions=[a.__dict__ for a in actions]
    )

@router.post("/{alert_id}/action", response_model=AlertResponse)
def perform_alert_action(
    alert_id: str,
    action_req: AlertActionCreate,
    current_user: User = Depends(require_role(["ROLE_OPERATOR", "ROLE_ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Executes triage workflow: ACKNOWLEDGE, ASSIGN, ESCALATE, RESOLVE, DISMISS.
    Mandatory reason is enforced if DISMISS is selected.
    """
    alt = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alert record not found")
        
    from_status = alt.status
    action = action_req.action.upper()
    
    if action == "ACKNOWLEDGE":
        to_status = "ACKNOWLEDGED"
    elif action == "ASSIGN":
        to_status = "ASSIGNED"
        alt.assigned_to = action_req.assigned_to or current_user.username
    elif action == "ESCALATE":
        to_status = "ESCALATED"
        alt.severity = "CRITICAL"
    elif action == "RESOLVE":
        to_status = "RESOLVED"
        alt.resolution_notes = action_req.notes
    elif action == "DISMISS":
        if not action_req.reason:
            raise HTTPException(
                status_code=400,
                detail="Mandatory dismissal reason is required (e.g., FALSE_POSITIVE_OCR, UNMATCHED_CHARACTER, OUTDATED_ALERT)"
            )
        to_status = "DISMISSED"
        alt.dismissal_reason = action_req.reason
        alt.resolution_notes = action_req.notes
    elif action == "ANNOTATE":
        to_status = from_status
        if action_req.notes:
            alt.resolution_notes = (alt.resolution_notes or "") + f"\n[{current_user.username}]: {action_req.notes}"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {action}")
        
    alt.status = to_status
    alt.updated_at = datetime.now(timezone.utc)
    
    action_log = AlertAction(
        id=f"act-{uuid.uuid4().hex[:8]}",
        alert_id=alt.id,
        user_id=current_user.id,
        username=current_user.username,
        action=action,
        from_status=from_status,
        to_status=to_status,
        notes=action_req.notes,
        reason=action_req.reason,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(action_log)
    db.commit()
    db.refresh(alt)
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="ALERT_STATE_CHANGE",
        target_type="ALERT",
        target_id=alt.id,
        details={
            "action": action,
            "from_status": from_status,
            "to_status": to_status,
            "reason": action_req.reason
        }
    )
    
    return alt
