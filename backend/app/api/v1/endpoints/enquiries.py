from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import math
from app.database.session import get_db
from app.schemas.enquiry import (
    EnquirySubmitPublic, EnquiryAdminResponse, EnquiryListResponse,
    EnquiryStatusUpdate, EnquiryNoteCreate, EnquiryNoteResponse
)
from app.models.admin import Admin
from app.services.enquiry_service import EnquiryService
from app.api.deps import get_current_admin

router = APIRouter(tags=["Enquiries"])

@router.post("/enquiries")
def submit_public_enquiry(data: EnquirySubmitPublic, db: Session = Depends(get_db)):
    """Public customer submits enquiry without login."""
    enquiry = EnquiryService.submit_public_enquiry(db, data)
    return {
        "success": True,
        "message": "Enquiry submitted successfully! Our representative will contact you shortly.",
        "enquiry_id": enquiry.id
    }

@router.get("/admin/enquiries", response_model=EnquiryListResponse)
def get_admin_enquiries(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    status: Optional[str] = None,
    source: Optional[str] = None,
    property_code: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    items, total = EnquiryService.get_admin_enquiries(
        db=db,
        page=page,
        limit=limit,
        status=status,
        source=source,
        property_code=property_code
    )
    total_pages = math.ceil(total / limit) if limit > 0 else 1

    formatted_items = []
    for enq in items:
        formatted_items.append(
            EnquiryAdminResponse(
                id=enq.id,
                customer_id=enq.customer_id,
                property_id=enq.property_id,
                property_code=enq.property_code,
                property_title=enq.property.title if enq.property else None,
                status=enq.status,
                message=enq.message,
                preferred_visit_date=enq.preferred_visit_date,
                preferred_visit_time=enq.preferred_visit_time,
                source=enq.source,
                utm_source=enq.utm_source,
                utm_medium=enq.utm_medium,
                utm_campaign=enq.utm_campaign,
                created_at=enq.created_at,
                updated_at=enq.updated_at,
                customer=enq.customer,
                notes=enq.notes
            )
        )

    return EnquiryListResponse(
        items=formatted_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/admin/enquiries/{enquiry_id}", response_model=EnquiryAdminResponse)
def get_enquiry_detail(
    enquiry_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    enq = EnquiryService.get_enquiry_by_id(db, enquiry_id)
    return EnquiryAdminResponse(
        id=enq.id,
        customer_id=enq.customer_id,
        property_id=enq.property_id,
        property_code=enq.property_code,
        property_title=enq.property.title if enq.property else None,
        status=enq.status,
        message=enq.message,
        preferred_visit_date=enq.preferred_visit_date,
        preferred_visit_time=enq.preferred_visit_time,
        source=enq.source,
        utm_source=enq.utm_source,
        utm_medium=enq.utm_medium,
        utm_campaign=enq.utm_campaign,
        created_at=enq.created_at,
        updated_at=enq.updated_at,
        customer=enq.customer,
        notes=enq.notes
    )

@router.patch("/admin/enquiries/{enquiry_id}/status")
def update_enquiry_status(
    enquiry_id: int,
    data: EnquiryStatusUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    enq = EnquiryService.update_enquiry_status(db, enquiry_id, data.status)
    return {"success": True, "message": f"Enquiry status updated to {enq.status}"}

@router.post("/admin/enquiries/{enquiry_id}/notes", response_model=EnquiryNoteResponse)
def add_enquiry_note(
    enquiry_id: int,
    data: EnquiryNoteCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return EnquiryService.add_enquiry_note(db, enquiry_id, data.note)
