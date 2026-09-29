from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    whatsapp = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    preferred_location = Column(String(150), nullable=True)
    budget = Column(Numeric(10, 2), nullable=True)
    preferred_bhk = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    enquiries = relationship("Enquiry", back_populates="customer")
    visits = relationship("Visit", back_populates="customer")
