from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    name: str
    mobile: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    preferred_location: Optional[str] = None
    budget: Optional[float] = None
    preferred_bhk: Optional[str] = None
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    preferred_location: Optional[str] = None
    budget: Optional[float] = None
    preferred_bhk: Optional[str] = None
    notes: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    total_enquiries: Optional[int] = 0
    total_visits: Optional[int] = 0

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    limit: int
    total_pages: int
