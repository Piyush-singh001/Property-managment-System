from sqlalchemy import Column, Integer, String, DateTime, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True)  # Non-destructive FK
    property_code = Column(String(50), nullable=True, index=True)  # Preserved snapshot for reporting

    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(String(50), nullable=False)
    status = Column(String(50), default="Pending", nullable=False, index=True)  # Pending, Confirmed, Rescheduled, Completed, Cancelled, No Show
    admin_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    enquiry = relationship("Enquiry", back_populates="visits")
    customer = relationship("Customer", back_populates="visits")
    property = relationship("Property", back_populates="visits")
