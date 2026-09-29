from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import Optional, List, Tuple
from datetime import date
from app.models.visit import Visit
from app.models.enquiry import Enquiry
from app.models.property import Property
from app.schemas.visit import VisitBookPublic, VisitStatusUpdate
from app.services.customer_service import CustomerService
from app.core.exceptions import NotFoundException, BadRequestException

class VisitService:
    @staticmethod
    def book_public_visit(db: Session, data: VisitBookPublic) -> Visit:
        # 1. Customer deduplication
        customer = CustomerService.get_or_create_customer(
            db=db,
            name=data.name,
            mobile=data.mobile,
            whatsapp=data.whatsapp,
            email=data.email
        )

        # 2. Look up property
        prop = db.query(Property).filter(Property.property_code == data.property_code).first()
        property_id = prop.id if prop else None

        # 3. Create an associated enquiry
        enquiry = Enquiry(
            customer_id=customer.id,
            property_id=property_id,
            property_code=data.property_code,
            status="Visit Scheduled",
            message=data.message or f"Requested property visit on {data.scheduled_date} at {data.scheduled_time}",
            preferred_visit_date=data.scheduled_date,
            preferred_visit_time=data.scheduled_time,
            source=data.source or "Website",
            utm_source=data.utm_source
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)

        # 4. Create visit
        visit = Visit(
            enquiry_id=enquiry.id,
            customer_id=customer.id,
            property_id=property_id,
            property_code=data.property_code,
            scheduled_date=data.scheduled_date,
            scheduled_time=data.scheduled_time,
            status="Pending"
        )
        db.add(visit)
        db.commit()
        db.refresh(visit)
        return visit

    @staticmethod
    def get_admin_visits(
        db: Session,
        page: int = 1,
        limit: int = 15,
        status: Optional[str] = None,
        date_filter: Optional[date] = None,
        property_code: Optional[str] = None
    ) -> Tuple[List[Visit], int]:
        query = db.query(Visit).options(
            joinedload(Visit.customer),
            joinedload(Visit.property),
            joinedload(Visit.enquiry)
        )

        if status:
            query = query.filter(Visit.status == status)

        if date_filter:
            query = query.filter(Visit.scheduled_date == date_filter)

        if property_code:
            query = query.filter(Visit.property_code.ilike(f"%{property_code}%"))

        query = query.order_by(desc(Visit.scheduled_date), desc(Visit.created_at))
        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_visit_by_id(db: Session, visit_id: int) -> Visit:
        visit = db.query(Visit).options(
            joinedload(Visit.customer),
            joinedload(Visit.property)
        ).filter(Visit.id == visit_id).first()

        if not visit:
            raise NotFoundException("Visit record not found", "VISIT_NOT_FOUND")
        return visit

    @staticmethod
    def update_visit_status(db: Session, visit_id: int, data: VisitStatusUpdate) -> Visit:
        valid_statuses = ["Pending", "Confirmed", "Rescheduled", "Completed", "Cancelled", "No Show"]
        if data.status not in valid_statuses:
            raise BadRequestException(f"Invalid visit status. Must be one of: {valid_statuses}", "INVALID_STATUS")

        visit = VisitService.get_visit_by_id(db, visit_id)
        visit.status = data.status
        if data.admin_notes is not None:
            visit.admin_notes = data.admin_notes
        if data.scheduled_date:
            visit.scheduled_date = data.scheduled_date
        if data.scheduled_time:
            visit.scheduled_time = data.scheduled_time

        db.commit()
        db.refresh(visit)
        return visit
