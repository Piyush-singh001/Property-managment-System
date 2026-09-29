from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.schemas.customer import CustomerResponse

class VisitBookPublic(BaseModel):
    name: str
    mobile: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    property_code: str
    scheduled_date: date
    scheduled_time: str
    message: Optional[str] = None
    source: Optional[str] = "Website"
    utm_source: Optional[str] = None

class VisitStatusUpdate(BaseModel):
    status: str  # Pending, Confirmed, Rescheduled, Completed, Cancelled, No Show
    admin_notes: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[str] = None

class VisitAdminResponse(BaseModel):
    id: int
    enquiry_id: Optional[int] = None
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    property_code: Optional[str] = None
    property_title: Optional[str] = None
    scheduled_date: date
    scheduled_time: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True

class VisitListResponse(BaseModel):
    items: List[VisitAdminResponse]
    total: int
    page: int
    limit: int
    total_pages: int
