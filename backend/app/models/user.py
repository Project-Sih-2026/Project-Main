from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="ROLE_OPERATOR", nullable=False)  # ROLE_ANALYST, ROLE_OPERATOR, ROLE_ADMIN
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
