from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.setting import PublicSettingsResponse, AdminSettingsUpdate
from app.models.admin import Admin
from app.services.setting_service import SettingService
from app.api.deps import get_current_admin

router = APIRouter(tags=["Settings"])

@router.get("/settings/public", response_model=PublicSettingsResponse)
def get_public_settings(db: Session = Depends(get_db)):
    """Public endpoint providing centralized business contact and WhatsApp template."""
    return SettingService.get_public_settings(db)

@router.get("/admin/settings", response_model=PublicSettingsResponse)
def get_admin_settings(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return SettingService.get_public_settings(db)

@router.put("/admin/settings", response_model=PublicSettingsResponse)
def update_admin_settings(
    data: AdminSettingsUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return SettingService.update_settings(db, data)
