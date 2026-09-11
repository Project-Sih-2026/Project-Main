from datetime import datetime
from pydantic import BaseModel

class HospitalBase(BaseModel):
    id: str
    name: str
    hospital_type: str
    district: str
    address: str
    latitude: float
    longitude: float
    emergency_phone: str | None = None
    total_beds: int | None = 100
    has_trauma_center: str | None = "YES"

class HospitalResponse(HospitalBase):
    created_at: datetime

    class Config:
        from_attributes = True
