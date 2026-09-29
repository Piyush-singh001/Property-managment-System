from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import math
from app.database.session import get_db
from app.schemas.property_public import PublicPropertyListResponse, PublicPropertyDetailResponse, PublicPropertyCardResponse
from app.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["Public Properties"])

@router.get("", response_model=PublicPropertyListResponse)
def get_public_properties(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    locality: Optional[str] = None,
    bhk: Optional[str] = None,
    property_type: Optional[str] = None,
    furnishing: Optional[str] = None,
    min_rent: Optional[float] = None,
    max_rent: Optional[float] = None,
    amenities: Optional[List[str]] = Query(None),
    sort: Optional[str] = "latest",
    db: Session = Depends(get_db)
):
    items, total = PropertyService.get_public_properties(
        db=db,
        page=page,
        limit=limit,
        search=search,
        locality=locality,
        bhk=bhk,
        property_type=property_type,
        furnishing=furnishing,
        min_rent=min_rent,
        max_rent=max_rent,
        amenities=amenities,
        sort=sort
    )

    card_items = []
    for prop in items:
        # Pick cover image or first actual photo
        cover_img = None
        for img in prop.images:
            if img.is_cover:
                cover_img = img.image_url
                break
        
        video_exts = ('.mp4', '.webm', '.ogg', '.mov')
        if cover_img and cover_img.lower().endswith(video_exts):
            photo = next((i.image_url for i in prop.images if not i.image_url.lower().endswith(video_exts)), None)
            if photo:
                cover_img = photo
        elif not cover_img and prop.images:
            photo = next((i.image_url for i in prop.images if not i.image_url.lower().endswith(video_exts)), None)
            cover_img = photo if photo else prop.images[0].image_url

        card_items.append(
            PublicPropertyCardResponse(
                property_code=prop.property_code,
                title=prop.title,
                property_type=prop.property_type,
                bhk=prop.bhk,
                furnishing=prop.furnishing,
                property_status=prop.property_status,
                locality=prop.locality,
                society_name=prop.society_name,
                built_up_area=prop.built_up_area,
                carpet_area=prop.carpet_area,
                bedrooms=prop.bedrooms,
                bathrooms=prop.bathrooms,
                balconies=prop.balconies,
                rent=float(prop.rent),
                maintenance=float(prop.maintenance) if prop.maintenance else None,
                maintenance_included=prop.maintenance_included,
                cover_image=cover_img,
                created_at=prop.created_at
            )
        )

    total_pages = math.ceil(total / limit) if limit > 0 else 1

    return PublicPropertyListResponse(
        items=card_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{property_code}", response_model=PublicPropertyDetailResponse)
def get_public_property_detail(property_code: str, db: Session = Depends(get_db)):
    prop = PropertyService.get_public_property_by_code(db, property_code)
    return prop
