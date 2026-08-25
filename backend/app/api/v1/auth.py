from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user_optional, get_password_hash
from app.models.user import User
from app.schemas.user import TokenResponse, LoginRequest, UserResponse
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
        
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    log_audit_event(
        db=db,
        user_id=user.id,
        username=user.username,
        action_type="AUTH_LOGIN",
        target_type="USER",
        target_id=user.id,
        details={"role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user_optional)):
    return current_user

@router.post("/switch-role", response_model=UserResponse)
def switch_active_role(role: str, current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """
    Demo/testing helper to switch active persona (ROLE_ANALYST, ROLE_OPERATOR, ROLE_ADMIN).
    """
    if role not in ["ROLE_ANALYST", "ROLE_OPERATOR", "ROLE_ADMIN"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    current_user.role = role
    db.commit()
    db.refresh(current_user)
    
    log_audit_event(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action_type="ROLE_SWITCH",
        target_type="USER",
        target_id=current_user.id,
        details={"new_role": role}
    )
    return current_user
