import re
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.core.exceptions import BadRequestException

def normalize_indian_mobile(mobile: str) -> str:
    """Normalizes an Indian mobile number to 10 digits.
    Validates starting digit 6, 7, 8, or 9."""
    if not mobile:
        raise BadRequestException("Mobile number is required", "INVALID_MOBILE")
    
    # Strip spaces, hyphens, plus
    clean = re.sub(r"[\s\-\+\(\)]", "", mobile)
    
    # Remove leading +91 or 91 or 0 if present
    if clean.startswith("910") and len(clean) == 13:
        clean = clean[3:]
    elif clean.startswith("91") and len(clean) == 12:
        clean = clean[2:]
    elif clean.startswith("0") and len(clean) == 11:
        clean = clean[1:]
        
    if not (len(clean) == 10 and clean.isdigit() and clean[0] in "6789"):
        raise BadRequestException("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9", "INVALID_MOBILE")
    
    return clean

class CustomerService:
    @staticmethod
    def get_or_create_customer(
        db: Session,
        name: str,
        mobile: str,
        whatsapp: str = None,
        email: str = None,
        preferred_location: str = None,
        budget: float = None,
        preferred_bhk: str = None
    ) -> Customer:
        normalized_mobile = normalize_indian_mobile(mobile)
        
        customer = db.query(Customer).filter(Customer.mobile == normalized_mobile).first()
        if customer:
            # Update customer info if newly provided
            if name and not customer.name:
                customer.name = name
            if email and not customer.email:
                customer.email = email
            if whatsapp and not customer.whatsapp:
                customer.whatsapp = whatsapp
            if preferred_location and not customer.preferred_location:
                customer.preferred_location = preferred_location
            if budget and not customer.budget:
                customer.budget = budget
            if preferred_bhk and not customer.preferred_bhk:
                customer.preferred_bhk = preferred_bhk
            db.commit()
            db.refresh(customer)
            return customer
        
        # Create new customer
        new_customer = Customer(
            name=name,
            mobile=normalized_mobile,
            whatsapp=whatsapp or normalized_mobile,
            email=email,
            preferred_location=preferred_location,
            budget=budget,
            preferred_bhk=preferred_bhk
        )
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)
        return new_customer
