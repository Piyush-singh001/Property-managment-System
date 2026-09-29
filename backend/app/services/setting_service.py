from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.setting import SystemSetting
from app.schemas.setting import PublicSettingsResponse, AdminSettingsUpdate

DEFAULT_SETTINGS = {
    "business_name": "Shree Radha Kripa Reality",
    "phone": "+91 8510992504",
    "whatsapp": "+918510992504",
    "email": "shreeradhakripareality@gmail.com",
    "address": "Plot 42, Sector 62, Noida, Uttar Pradesh 201309",
    "maps_url": "https://maps.google.com",
    "default_whatsapp_message": "Hi, I am interested in property {property_code} - {bhk} {furnishing} in {locality}."
}

class SettingService:
    @staticmethod
    def get_public_settings(db: Session) -> PublicSettingsResponse:
        db_settings = db.query(SystemSetting).all()
        data = dict(DEFAULT_SETTINGS)
        for s in db_settings:
            data[s.key] = s.value
        return PublicSettingsResponse(**data)

    @staticmethod
    def update_settings(db: Session, update_data: AdminSettingsUpdate) -> PublicSettingsResponse:
        fields = update_data.model_dump(exclude_unset=True)
        for key, val in fields.items():
            if val is not None:
                setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
                if setting:
                    setting.value = str(val)
                else:
                    new_s = SystemSetting(key=key, value=str(val), is_public=True)
                    db.add(new_s)
        db.commit()
        return SettingService.get_public_settings(db)
