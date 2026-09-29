from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from datetime import date
from app.database.session import get_db
from app.models.property import Property
from app.models.enquiry import Enquiry
from app.models.visit import Visit
from app.models.admin import Admin
from app.schemas.dashboard import DashboardMetrics
from app.schemas.enquiry import EnquiryAdminResponse
from app.schemas.visit import VisitAdminResponse
from app.schemas.property_admin import PropertyAdminResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])

@router.get("", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    today = date.today()

    # Active properties counts
    active_props = db.query(Property).filter(Property.deleted_at.is_(None))
    total_properties = active_props.count()
    available_properties = active_props.filter(Property.property_status == "Available").count()
    reserved_properties = active_props.filter(Property.property_status == "Reserved").count()
    rented_properties = active_props.filter(Property.property_status == "Rented").count()

    draft_properties = active_props.filter(Property.publication_status == "Draft").count()
    published_properties = active_props.filter(Property.publication_status == "Published").count()
    unpublished_properties = active_props.filter(Property.publication_status == "Unpublished").count()

    # Soft-deleted / archived
    archived_properties = db.query(Property).filter(Property.deleted_at.isnot(None)).count()

    # Enquiries
    total_enquiries = db.query(Enquiry).count()
    new_enquiries = db.query(Enquiry).filter(Enquiry.status == "New").count()

    # Visits
    pending_visits = db.query(Visit).filter(Visit.status == "Pending").count()
    completed_visits = db.query(Visit).filter(Visit.status == "Completed").count()
    upcoming_visits = db.query(Visit).filter(
        Visit.scheduled_date >= today,
        Visit.status.in_(["Pending", "Confirmed"])
    ).count()

    # Recent Enquiries
    recent_enqs = db.query(Enquiry).options(
        joinedload(Enquiry.customer),
        joinedload(Enquiry.property)
    ).order_by(desc(Enquiry.created_at)).limit(5).all()

    formatted_enqs = [
        EnquiryAdminResponse(
            id=e.id,
            customer_id=e.customer_id,
            property_id=e.property_id,
            property_code=e.property_code,
            property_title=e.property.title if e.property else None,
            status=e.status,
            message=e.message,
            preferred_visit_date=e.preferred_visit_date,
            preferred_visit_time=e.preferred_visit_time,
            source=e.source,
            utm_source=e.utm_source,
            utm_medium=e.utm_medium,
            utm_campaign=e.utm_campaign,
            created_at=e.created_at,
            updated_at=e.updated_at,
            customer=e.customer,
            notes=e.notes
        )
        for e in recent_enqs
    ]

    # Upcoming Visits
    upcoming_v = db.query(Visit).options(
        joinedload(Visit.customer),
        joinedload(Visit.property)
    ).filter(
        Visit.scheduled_date >= today
    ).order_by(Visit.scheduled_date.asc(), Visit.scheduled_time.asc()).limit(5).all()

    formatted_visits = [
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
        for v in upcoming_v
    ]

    # Recent Properties
    recent_p = db.query(Property).options(
        joinedload(Property.images),
        joinedload(Property.amenities)
    ).filter(Property.deleted_at.is_(None)).order_by(desc(Property.created_at)).limit(5).all()

    return DashboardMetrics(
        total_properties=total_properties,
        available_properties=available_properties,
        reserved_properties=reserved_properties,
        rented_properties=rented_properties,
        draft_properties=draft_properties,
        published_properties=published_properties,
        unpublished_properties=unpublished_properties,
        archived_properties=archived_properties,
        total_enquiries=total_enquiries,
        new_enquiries=new_enquiries,
        pending_visits=pending_visits,
        completed_visits=completed_visits,
        upcoming_visits=upcoming_visits,
        recent_enquiries=formatted_enqs,
        upcoming_visits_list=formatted_visits,
        recent_properties=recent_p
    )
