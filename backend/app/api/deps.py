from fastapi import Depends, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.admin import Admin
from app.core.security import extract_token_from_request, decode_access_token
from app.core.exceptions import UnauthorizedException

def get_current_admin(
    request: Request,
    db: Session = Depends(get_db)
) -> Admin:
    token = extract_token_from_request(request)
    if not token:
        raise UnauthorizedException("Authentication token required", "TOKEN_MISSING")

    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token", "TOKEN_INVALID")

    admin_id = payload.get("sub")
    if not admin_id:
        raise UnauthorizedException("Malformed token payload", "TOKEN_MALFORMED")

    admin = db.query(Admin).filter(Admin.id == int(admin_id)).first()
    if not admin or not admin.is_active:
        raise UnauthorizedException("Admin account inactive or not found", "ADMIN_INACTIVE")

    return admin
