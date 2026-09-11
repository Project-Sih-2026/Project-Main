from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalResponse

router = APIRouter(prefix="/hospitals", tags=["Hospitals & Emergency Facilities"])

@router.get("", response_model=list[HospitalResponse])
def list_hospitals(district: str | None = None, db: Session = Depends(get_db)):
    """
    Returns all registered hospital locations in the East Delhi grid.
    """
    query = db.query(Hospital)
    if district and district != "All districts":
        query = query.filter(Hospital.district.ilike(f"%{district}%"))
    return query.order_by(Hospital.name).all()

@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hosp
