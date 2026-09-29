from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import math
from app.database.session import get_db
from app.schemas.visit import (
    VisitBookPublic, VisitAdminResponse, VisitListResponse, VisitStatusUpdate
)
from app.models.admin import Admin
from app.services.visit_service import VisitService
from app.api.deps import get_current_admin

router = APIRouter(tags=["Visits"])

@router.post("/visits")
def book_public_visit(data: VisitBookPublic, db: Session = Depends(get_db)):
    """Public customer requests a property visit without login."""
    visit = VisitService.book_public_visit(db, data)
    return {
        "success": True,
        "message": "Visit scheduled successfully! Our broker will confirm your visit timing.",
        "visit_id": visit.id
    }

@router.get("/admin/visits", response_model=VisitListResponse)
def get_admin_visits(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    status: Optional[str] = None,
    date_filter: Optional[date] = None,
    property_code: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    items, total = VisitService.get_admin_visits(
        db=db,
        page=page,
        limit=limit,
        status=status,
        date_filter=date_filter,
        property_code=property_code
    )
    total_pages = math.ceil(total / limit) if limit > 0 else 1

    formatted_items = []
    for v in items:
        formatted_items.append(
            VisitAdminResponse(
                id=v.id,
                enquiry_id=v.enquiry_id,
                customer_id=v.customer_id,
                property_id=v.property_id,
                property_code=v.property_code,
                property_title=v.property.title if v.property else None,
                scheduled_date=v.scheduled_date,
                scheduled_time=v.scheduled_time,
                status=v.status,
                admin_notes=v.admin_notes,
                created_at=v.created_at,
                updated_at=v.updated_at,
                customer=v.customer
            )
        )

    return VisitListResponse(
        items=formatted_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/admin/visits/{visit_id}", response_model=VisitAdminResponse)
def get_visit_detail(
    visit_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    v = VisitService.get_visit_by_id(db, visit_id)
    return VisitAdminResponse(
        id=v.id,
        enquiry_id=v.enquiry_id,
        customer_id=v.customer_id,
        property_id=v.property_id,
        property_code=v.property_code,
        property_title=v.property.title if v.property else None,
        scheduled_date=v.scheduled_date,
        scheduled_time=v.scheduled_time,
        status=v.status,
        admin_notes=v.admin_notes,
        created_at=v.created_at,
        updated_at=v.updated_at,
        customer=v.customer
    )

@router.patch("/admin/visits/{visit_id}/status")
def update_visit_status(
    visit_id: int,
    data: VisitStatusUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    visit = VisitService.update_visit_status(db, visit_id, data)
    return {"success": True, "message": f"Visit status updated to {visit.status}"}
