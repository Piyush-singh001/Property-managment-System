from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import Optional, List, Tuple
from app.models.enquiry import Enquiry, EnquiryNote
from app.models.property import Property
from app.schemas.enquiry import EnquirySubmitPublic
from app.services.customer_service import CustomerService
from app.core.exceptions import NotFoundException, BadRequestException

class EnquiryService:
    @staticmethod
    def submit_public_enquiry(db: Session, data: EnquirySubmitPublic) -> Enquiry:
        # 1. Customer deduplication
        customer = CustomerService.get_or_create_customer(
            db=db,
            name=data.name,
            mobile=data.mobile,
            whatsapp=data.whatsapp,
            email=data.email
        )

        # 2. Look up property if code provided
        property_id = None
        property_code = data.property_code
        if data.property_code:
            prop = db.query(Property).filter(Property.property_code == data.property_code).first()
            if prop:
                property_id = prop.id

        # 3. Create enquiry
        enquiry = Enquiry(
            customer_id=customer.id,
            property_id=property_id,
            property_code=property_code,
            status="New",
            message=data.message,
            preferred_visit_date=data.preferred_visit_date,
            preferred_visit_time=data.preferred_visit_time,
            source=data.source or "Website",
            utm_source=data.utm_source,
            utm_medium=data.utm_medium,
            utm_campaign=data.utm_campaign
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)
        return enquiry

    @staticmethod
    def get_admin_enquiries(
        db: Session,
        page: int = 1,
        limit: int = 15,
        status: Optional[str] = None,
        source: Optional[str] = None,
        property_code: Optional[str] = None
    ) -> Tuple[List[Enquiry], int]:
        query = db.query(Enquiry).options(
            joinedload(Enquiry.customer),
            joinedload(Enquiry.property),
            joinedload(Enquiry.notes)
        )

        if status:
            query = query.filter(Enquiry.status == status)

        if source:
            query = query.filter(Enquiry.source == source)

        if property_code:
            query = query.filter(Enquiry.property_code.ilike(f"%{property_code}%"))

        query = query.order_by(desc(Enquiry.created_at))
        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_enquiry_by_id(db: Session, enquiry_id: int) -> Enquiry:
        enquiry = db.query(Enquiry).options(
            joinedload(Enquiry.customer),
            joinedload(Enquiry.property),
            joinedload(Enquiry.notes)
        ).filter(Enquiry.id == enquiry_id).first()

        if not enquiry:
            raise NotFoundException("Enquiry not found", "ENQUIRY_NOT_FOUND")
        return enquiry

    @staticmethod
    def update_enquiry_status(db: Session, enquiry_id: int, new_status: str) -> Enquiry:
        valid_statuses = [
            "New", "Contacted", "Interested", "Visit Scheduled",
            "Visited", "Negotiation", "Booked", "Closed", "Not Interested"
        ]
        if new_status not in valid_statuses:
            raise BadRequestException(f"Invalid enquiry status. Must be one of: {valid_statuses}", "INVALID_STATUS")
        
        enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
        enquiry.status = new_status
        db.commit()
        db.refresh(enquiry)
        return enquiry

    @staticmethod
    def add_enquiry_note(db: Session, enquiry_id: int, note_text: str) -> EnquiryNote:
        enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
        note = EnquiryNote(enquiry_id=enquiry.id, note=note_text)
        db.add(note)
        db.commit()
        db.refresh(note)
        return note
