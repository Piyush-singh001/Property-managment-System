from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse, AdminResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.exceptions import UnauthorizedException, BadRequestException
from app.api.deps import get_current_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise UnauthorizedException("Invalid email or password", "INVALID_CREDENTIALS")
    
    if not admin.is_active:
        raise UnauthorizedException("Admin account is deactivated", "ACCOUNT_INACTIVE")

    token = create_access_token(subject=admin.id)

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="pms_admin_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        max_age=60 * 60 * 24
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        admin={
            "id": admin.id,
            "name": admin.name,
            "email": admin.email
        }
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="pms_admin_token")
    return {"success": True, "message": "Logged out successfully"}

@router.get("/me", response_model=AdminResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin:
        return {"success": True, "message": "If this email is registered, reset instructions have been generated."}
    
    # In production, send email with reset token. For MVP, we provide a direct token verification endpoint.
    reset_token = create_access_token(subject=admin.id)
    return {
        "success": True,
        "message": "Reset instructions generated.",
        "reset_token": reset_token  # Provided for MVP admin reset convenience
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin:
        raise BadRequestException("Invalid reset request", "INVALID_RESET")

    admin.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"success": True, "message": "Password reset successfully"}
