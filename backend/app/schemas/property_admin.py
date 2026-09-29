from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from app.schemas.amenity import AmenityResponse
from app.schemas.media import PropertyImageResponse, PropertyVideoResponse

class PropertyBase(BaseModel):
    title: str
    property_type: str
    bhk: str
    furnishing: str
    property_status: str = "Available"
    publication_status: str = "Draft"
    description: Optional[str] = None

    # Location
    locality: str
    society_name: Optional[str] = None
    tower: Optional[str] = None
    flat_number: Optional[str] = None
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

    # Financials
    rent: float
    security_deposit: Optional[float] = None
    maintenance: Optional[float] = None
    maintenance_included: bool = False
    electricity_included: bool = False
    water_charges: Optional[str] = None
    brokerage: Optional[float] = None
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

class PropertyCreate(PropertyBase):
    amenity_ids: Optional[List[int]] = []
    image_urls: Optional[List[str]] = []
    video_urls: Optional[List[str]] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    property_type: Optional[str] = None
    bhk: Optional[str] = None
    furnishing: Optional[str] = None
    property_status: Optional[str] = None
    publication_status: Optional[str] = None
    description: Optional[str] = None

    locality: Optional[str] = None
    society_name: Optional[str] = None
    tower: Optional[str] = None
    flat_number: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    maps_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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
    lift: Optional[bool] = None

    rent: Optional[float] = None
    security_deposit: Optional[float] = None
    maintenance: Optional[float] = None
    maintenance_included: Optional[bool] = None
    electricity_included: Optional[bool] = None
    water_charges: Optional[str] = None
    brokerage: Optional[float] = None
    other_charges: Optional[float] = None
    lock_in_period: Optional[str] = None
    minimum_stay: Optional[str] = None

    family_allowed: Optional[bool] = None
    bachelor_allowed: Optional[bool] = None
    male_allowed: Optional[bool] = None
    female_allowed: Optional[bool] = None
    pets_allowed: Optional[bool] = None
    smoking_allowed: Optional[bool] = None
    non_veg_allowed: Optional[bool] = None
    available_from: Optional[date] = None
    notice_period: Optional[str] = None

    amenity_ids: Optional[List[int]] = None

class PropertyStatusUpdate(BaseModel):
    property_status: str  # Available, Reserved, Rented, Inactive

class PropertyPublicationUpdate(BaseModel):
    publication_status: str  # Draft, Published, Unpublished

class PropertyAdminResponse(PropertyBase):
    id: int
    property_code: str
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    images: List[PropertyImageResponse] = []
    videos: List[PropertyVideoResponse] = []
    amenities: List[AmenityResponse] = []

    class Config:
        from_attributes = True

class PropertyAdminListResponse(BaseModel):
    items: List[PropertyAdminResponse]
    total: int
    page: int
    limit: int
    total_pages: int
