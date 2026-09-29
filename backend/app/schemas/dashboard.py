from pydantic import BaseModel
from typing import List, Dict, Any
from app.schemas.property_admin import PropertyAdminResponse
from app.schemas.enquiry import EnquiryAdminResponse
from app.schemas.visit import VisitAdminResponse

class DashboardMetrics(BaseModel):
    total_properties: int
    available_properties: int
    reserved_properties: int
    rented_properties: int
    draft_properties: int
    published_properties: int
    unpublished_properties: int
    archived_properties: int

    total_enquiries: int
    new_enquiries: int
    pending_visits: int
    completed_visits: int
    upcoming_visits: int

    recent_enquiries: List[EnquiryAdminResponse] = []
    upcoming_visits_list: List[VisitAdminResponse] = []
    recent_properties: List[PropertyAdminResponse] = []
