from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, properties_public, properties_admin,
    enquiries, visits, customers, settings, amenities, dashboard, upload
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(properties_public.router)
api_router.include_router(properties_admin.router)
api_router.include_router(enquiries.router)
api_router.include_router(visits.router)
api_router.include_router(customers.router)
api_router.include_router(settings.router)
api_router.include_router(amenities.router)
api_router.include_router(dashboard.router)
api_router.include_router(upload.router)
