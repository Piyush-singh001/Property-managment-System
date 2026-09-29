from sqlalchemy import Column, Integer, String, DateTime, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True)
    property_code = Column(String(50), nullable=True, index=True)  # Snapshot for historical integrity
    
    status = Column(String(50), default="New", nullable=False, index=True)  # New, Contacted, Interested, Visit Scheduled, Visited, Negotiation, Booked, Closed, Not Interested
    message = Column(Text, nullable=True)
    preferred_visit_date = Column(Date, nullable=True)
    preferred_visit_time = Column(String(50), nullable=True)
    
    # Source tracking & UTM
    source = Column(String(50), default="Website", nullable=False, index=True)  # Website, WhatsApp, Instagram, Facebook, Google, OLX, Referral, Direct, Other
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship("Customer", back_populates="enquiries")
    property = relationship("Property", back_populates="enquiries")
    notes = relationship("EnquiryNote", back_populates="enquiry", cascade="all, delete-orphan", order_by="EnquiryNote.created_at.desc()")
    visits = relationship("Visit", back_populates="enquiry")

class EnquiryNote(Base):
    __tablename__ = "enquiry_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    enquiry = relationship("Enquiry", back_populates="notes")
