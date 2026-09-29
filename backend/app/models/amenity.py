from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from datetime import datetime, timezone
from app.database.session import Base

property_amenities = Table(
    "property_amenities",
    Base.metadata,
    Column("property_id", Integer, ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)
)

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
