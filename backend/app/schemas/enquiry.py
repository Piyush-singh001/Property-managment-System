from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.schemas.customer import CustomerResponse

class EnquirySubmitPublic(BaseModel):
    name: str
    mobile: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    property_code: Optional[str] = None
    message: Optional[str] = None
    preferred_visit_date: Optional[date] = None
    preferred_visit_time: Optional[str] = None
    source: Optional[str] = "Website"
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None

class EnquiryNoteCreate(BaseModel):
    note: str

class EnquiryNoteResponse(BaseModel):
    id: int
    enquiry_id: int
    note: str
    created_at: datetime

    class Config:
        from_attributes = True

class EnquiryStatusUpdate(BaseModel):
    status: str  # New, Contacted, Interested, Visit Scheduled, Visited, Negotiation, Booked, Closed, Not Interested

class EnquiryAdminResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    property_code: Optional[str] = None
    property_title: Optional[str] = None
    status: str
    message: Optional[str] = None
    preferred_visit_date: Optional[date] = None
    preferred_visit_time: Optional[str] = None
    source: str
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    notes: List[EnquiryNoteResponse] = []

    class Config:
        from_attributes = True

class EnquiryListResponse(BaseModel):
    items: List[EnquiryAdminResponse]
    total: int
    page: int
    limit: int
    total_pages: int
