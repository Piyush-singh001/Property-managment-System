from pydantic import BaseModel
from typing import Dict, Any, Optional

class PublicSettingsResponse(BaseModel):
    business_name: str = "Shree Radha Kripa Reality"
    phone: str = "+91 8510992504"
    whatsapp: str = "+918510992504"
    email: str = "shreeradhakripareality@gmail.com"
    address: str = "Plot 42, Sector 62, Noida, Uttar Pradesh 201309"
    maps_url: Optional[str] = "https://maps.google.com"
    default_whatsapp_message: str = "Hi, I am interested in property {property_code} - {bhk} {furnishing} in {locality}."

class AdminSettingsUpdate(BaseModel):
    business_name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    maps_url: Optional[str] = None
    default_whatsapp_message: Optional[str] = None
