from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import Optional
import math
from app.database.session import get_db
from app.models.customer import Customer
from app.models.enquiry import Enquiry
from app.models.visit import Visit
from app.models.admin import Admin
from app.schemas.customer import CustomerResponse, CustomerListResponse, CustomerUpdate
from app.api.deps import get_current_admin
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/admin/customers", tags=["Admin Customers"])

@router.get("", response_model=CustomerListResponse)
def get_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    search: Optional[str] = None,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(pattern),
                Customer.mobile.ilike(pattern),
                Customer.email.ilike(pattern)
            )
        )

    query = query.order_by(desc(Customer.updated_at))
    total = query.count()
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()
    total_pages = math.ceil(total / limit) if limit > 0 else 1

    result_items = []
    for c in items:
        total_enquiries = db.query(Enquiry).filter(Enquiry.customer_id == c.id).count()
        total_visits = db.query(Visit).filter(Visit.customer_id == c.id).count()
        res = CustomerResponse(
            id=c.id,
            name=c.name,
            mobile=c.mobile,
            whatsapp=c.whatsapp,
            email=c.email,
            preferred_location=c.preferred_location,
            budget=float(c.budget) if c.budget else None,
            preferred_bhk=c.preferred_bhk,
            notes=c.notes,
            created_at=c.created_at,
            updated_at=c.updated_at,
            total_enquiries=total_enquiries,
            total_visits=total_visits
        )
        result_items.append(res)

    return CustomerListResponse(
        items=result_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise NotFoundException("Customer not found", "CUSTOMER_NOT_FOUND")
    
    total_enquiries = db.query(Enquiry).filter(Enquiry.customer_id == c.id).count()
    total_visits = db.query(Visit).filter(Visit.customer_id == c.id).count()
    return CustomerResponse(
        id=c.id,
        name=c.name,
        mobile=c.mobile,
        whatsapp=c.whatsapp,
        email=c.email,
        preferred_location=c.preferred_location,
        budget=float(c.budget) if c.budget else None,
        preferred_bhk=c.preferred_bhk,
        notes=c.notes,
        created_at=c.created_at,
        updated_at=c.updated_at,
        total_enquiries=total_enquiries,
        total_visits=total_visits
    )

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise NotFoundException("Customer not found", "CUSTOMER_NOT_FOUND")
    
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
        
    db.commit()
    db.refresh(c)
    
    total_enquiries = db.query(Enquiry).filter(Enquiry.customer_id == c.id).count()
    total_visits = db.query(Visit).filter(Visit.customer_id == c.id).count()
    return CustomerResponse(
        id=c.id,
        name=c.name,
        mobile=c.mobile,
        whatsapp=c.whatsapp,
        email=c.email,
        preferred_location=c.preferred_location,
        budget=float(c.budget) if c.budget else None,
        preferred_bhk=c.preferred_bhk,
        notes=c.notes,
        created_at=c.created_at,
        updated_at=c.updated_at,
        total_enquiries=total_enquiries,
        total_visits=total_visits
    )
