from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AmenityBase(BaseModel):
    name: str
    icon: Optional[str] = None
    is_active: bool = True

class AmenityCreate(AmenityBase):
    pass

class AmenityUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

class AmenityResponse(AmenityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
