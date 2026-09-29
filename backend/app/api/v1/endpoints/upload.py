import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from app.core.config import settings
from app.core.exceptions import BadRequestException
from app.models.admin import Admin
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin/media", tags=["Media Upload"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    # Validate content type
    allowed_types = settings.ALLOWED_IMAGE_TYPES + settings.ALLOWED_VIDEO_TYPES
    if file.content_type not in allowed_types:
        raise BadRequestException(
            f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WebP, MP4, WebM.",
            "UNSUPPORTED_FILE_TYPE"
        )

    # Read and check size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise BadRequestException(
            f"File size exceeds limit of {settings.MAX_UPLOAD_SIZE_MB}MB.",
            "FILE_TOO_LARGE"
        )

    # Generate safe unique filename
    ext = os.path.splitext(file.filename)[1].lower()
    if not ext:
        ext = ".jpg" if "image" in file.content_type else ".mp4"
        
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    destination_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(destination_path, "wb") as f:
        f.write(contents)

    file_url = f"/static/uploads/{unique_filename}"

    return {
        "success": True,
        "filename": unique_filename,
        "url": file_url,
        "media_type": "video" if file.content_type in settings.ALLOWED_VIDEO_TYPES else "image"
    }
