from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.amenity import Amenity
from app.models.admin import Admin
from app.schemas.amenity import AmenityResponse, AmenityCreate, AmenityUpdate
from app.api.deps import get_current_admin
from app.core.exceptions import NotFoundException

router = APIRouter(tags=["Amenities"])

@router.get("/amenities", response_model=List[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    """Public list of active amenities for search and property display."""
    return db.query(Amenity).filter(Amenity.is_active == True).order_by(Amenity.name).all()

@router.post("/admin/amenities", response_model=AmenityResponse)
def create_amenity(
    data: AmenityCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    amenity = Amenity(**data.model_dump())
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    return amenity

@router.put("/admin/amenities/{amenity_id}", response_model=AmenityResponse)
def update_amenity(
    amenity_id: int,
    data: AmenityUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    am = db.query(Amenity).filter(Amenity.id == amenity_id).first()
    if not am:
        raise NotFoundException("Amenity not found", "AMENITY_NOT_FOUND")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(am, k, v)
    db.commit()
    db.refresh(am)
    return am
