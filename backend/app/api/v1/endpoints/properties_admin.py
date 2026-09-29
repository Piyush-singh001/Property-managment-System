from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import math
from app.database.session import get_db
from app.schemas.property_admin import (
    PropertyAdminResponse, PropertyAdminListResponse,
    PropertyCreate, PropertyUpdate, PropertyStatusUpdate, PropertyPublicationUpdate
)
from app.schemas.media import ImageReorderItem, PropertyImageResponse
from app.models.media import PropertyImage
from app.models.admin import Admin
from app.services.property_service import PropertyService
from app.api.deps import get_current_admin
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/admin/properties", tags=["Admin Properties"])

@router.get("", response_model=PropertyAdminListResponse)
def get_admin_properties(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    search: Optional[str] = None,
    property_status: Optional[str] = None,
    publication_status: Optional[str] = None,
    bhk: Optional[str] = None,
    include_archived: bool = Query(False),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    items, total = PropertyService.get_admin_properties(
        db=db,
        page=page,
        limit=limit,
        search=search,
        property_status=property_status,
        publication_status=publication_status,
        bhk=bhk,
        include_archived=include_archived
    )
    total_pages = math.ceil(total / limit) if limit > 0 else 1
    return PropertyAdminListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.post("", response_model=PropertyAdminResponse)
def create_property(
    data: PropertyCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.create_property(db, data)

@router.get("/{property_id}", response_model=PropertyAdminResponse)
def get_property(
    property_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.get_property_by_id(db, property_id)

@router.put("/{property_id}", response_model=PropertyAdminResponse)
def update_property(
    property_id: int,
    data: PropertyUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.update_property(db, property_id, data)

@router.patch("/{property_id}/status", response_model=PropertyAdminResponse)
def update_property_status(
    property_id: int,
    data: PropertyStatusUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.update_property_status(db, property_id, data.property_status)

@router.patch("/{property_id}/publication", response_model=PropertyAdminResponse)
def update_publication_status(
    property_id: int,
    data: PropertyPublicationUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.update_publication_status(db, property_id, data.publication_status)

@router.delete("/{property_id}")
def archive_property(
    property_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Soft-deletes/archives the property, preserving historical enquiries and visits."""
    PropertyService.soft_delete_property(db, property_id)
    return {"success": True, "message": "Property archived successfully"}

@router.post("/{property_id}/restore", response_model=PropertyAdminResponse)
def restore_property(
    property_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.restore_property(db, property_id)

@router.post("/{property_id}/duplicate", response_model=PropertyAdminResponse)
def duplicate_property(
    property_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return PropertyService.duplicate_property(db, property_id)

@router.post("/{property_id}/images/reorder")
def reorder_images(
    property_id: int,
    items: List[ImageReorderItem],
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Verify property exists
    PropertyService.get_property_by_id(db, property_id)
    for item in items:
        img = db.query(PropertyImage).filter(
            PropertyImage.id == item.id,
            PropertyImage.property_id == property_id
        ).first()
        if img:
            img.sort_order = item.sort_order
            img.is_cover = item.is_cover
    db.commit()
    return {"success": True, "message": "Images reordered successfully"}

@router.delete("/{property_id}/images/{image_id}")
def delete_image(
    property_id: int,
    image_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    img = db.query(PropertyImage).filter(
        PropertyImage.id == image_id,
        PropertyImage.property_id == property_id
    ).first()
    if not img:
        raise NotFoundException("Image not found", "IMAGE_NOT_FOUND")
    db.delete(img)
    db.commit()
    return {"success": True, "message": "Image deleted successfully"}
