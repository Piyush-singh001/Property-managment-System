from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from app.schemas.amenity import AmenityResponse
from app.schemas.media import PropertyImageResponse, PropertyVideoResponse

class PublicPropertyCardResponse(BaseModel):
    property_code: str
    title: str
    property_type: str
    bhk: str
    furnishing: str
    property_status: str  # Available, Reserved, Rented
    locality: str
    society_name: Optional[str] = None
    built_up_area: Optional[float] = None
    carpet_area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    balconies: Optional[int] = None
    rent: float
    maintenance: Optional[float] = None
    maintenance_included: bool = False
    cover_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PublicPropertyDetailResponse(BaseModel):
    property_code: str
    title: str
    property_type: str
    bhk: str
    furnishing: str
    property_status: str
    description: Optional[str] = None

    # Location (Sanitized: NO flat_number or tower)
    locality: str
    society_name: Optional[str] = None
    address: str
    pincode: Optional[str] = None
    maps_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Details
    built_up_area: Optional[float] = None
    carpet_area: Optional[float] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    balconies: Optional[int] = None
    facing: Optional[str] = None
    property_age: Optional[str] = None
    parking: Optional[str] = None
    lift: bool = False

    # Financials (NO brokerage)
    rent: float
    security_deposit: Optional[float] = None
    maintenance: Optional[float] = None
    maintenance_included: bool = False
    electricity_included: bool = False
    water_charges: Optional[str] = None
    other_charges: Optional[float] = None
    lock_in_period: Optional[str] = None
    minimum_stay: Optional[str] = None

    # Preferences
    family_allowed: bool = True
    bachelor_allowed: bool = True
    male_allowed: bool = True
    female_allowed: bool = True
    pets_allowed: bool = False
    smoking_allowed: bool = False
    non_veg_allowed: bool = True
    available_from: Optional[date] = None
    notice_period: Optional[str] = None

    # Media & Amenities
    images: List[PropertyImageResponse] = []
    videos: List[PropertyVideoResponse] = []
    amenities: List[AmenityResponse] = []

    created_at: datetime

    class Config:
        from_attributes = True

class PublicPropertyListResponse(BaseModel):
    items: List[PublicPropertyCardResponse]
    total: int
    page: int
    limit: int
    total_pages: int
