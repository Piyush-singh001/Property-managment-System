from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Numeric, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
from app.models.amenity import property_amenities

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False, index=True)
    property_type = Column(String(50), nullable=False)  # Flat, Apartment, Builder Floor, Villa, Independent House, Other
    bhk = Column(String(50), nullable=False, index=True)  # 1 BHK, 2 BHK, 3 BHK, 4 BHK, 5+ BHK
    furnishing = Column(String(50), nullable=False)  # Fully Furnished, Semi Furnished, Unfurnished
    
    # Independent statuses
    property_status = Column(String(50), default="Available", nullable=False, index=True)  # Available, Reserved, Rented, Inactive
    publication_status = Column(String(50), default="Draft", nullable=False, index=True)  # Draft, Published, Unpublished
    
    description = Column(Text, nullable=True)

    # Location fields
    locality = Column(String(150), nullable=False, index=True)
    society_name = Column(String(150), nullable=True)
    tower = Column(String(50), nullable=True)  # Sensitive Admin-only
    flat_number = Column(String(50), nullable=True)  # Sensitive Admin-only
    address = Column(Text, nullable=False)
    pincode = Column(String(10), nullable=True)
    maps_url = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)

    # Details
    built_up_area = Column(Float, nullable=True)
    carpet_area = Column(Float, nullable=True)
    floor = Column(Integer, nullable=True)
    total_floors = Column(Integer, nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    balconies = Column(Integer, nullable=True)
    facing = Column(String(50), nullable=True)
    property_age = Column(String(50), nullable=True)
    parking = Column(String(100), nullable=True)
    lift = Column(Boolean, default=False)

    # Rent & Charges
    rent = Column(Numeric(10, 2), nullable=False, index=True)
    security_deposit = Column(Numeric(10, 2), nullable=True)
    maintenance = Column(Numeric(10, 2), nullable=True)
    maintenance_included = Column(Boolean, default=False)
    electricity_included = Column(Boolean, default=False)
    water_charges = Column(String(100), nullable=True)
    brokerage = Column(Numeric(10, 2), nullable=True)  # Sensitive Admin-only
    other_charges = Column(Numeric(10, 2), nullable=True)
    lock_in_period = Column(String(100), nullable=True)
    minimum_stay = Column(String(100), nullable=True)

    # Rental Preferences
    family_allowed = Column(Boolean, default=True)
    bachelor_allowed = Column(Boolean, default=True)
    male_allowed = Column(Boolean, default=True)
    female_allowed = Column(Boolean, default=True)
    pets_allowed = Column(Boolean, default=False)
    smoking_allowed = Column(Boolean, default=False)
    non_veg_allowed = Column(Boolean, default=True)
    available_from = Column(Date, nullable=True)
    notice_period = Column(String(100), nullable=True)

    # Soft deletion & Timestamps
    deleted_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.sort_order")
    videos = relationship("PropertyVideo", back_populates="property", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary=property_amenities, backref="properties")
    enquiries = relationship("Enquiry", back_populates="property")
    visits = relationship("Visit", back_populates="property")
