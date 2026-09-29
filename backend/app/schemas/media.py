from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PropertyImageResponse(BaseModel):
    id: int
    property_id: int
    image_url: str
    sort_order: int
    is_cover: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PropertyVideoResponse(BaseModel):
    id: int
    property_id: int
    video_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class ImageReorderItem(BaseModel):
    id: int
    sort_order: int
    is_cover: bool = False
