from datetime import datetime
from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "ROLE_OPERATOR"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    username: str
    password: str
