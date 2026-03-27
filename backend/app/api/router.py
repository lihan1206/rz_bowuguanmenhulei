from fastapi import APIRouter

from app.api.routes import admin, auth, comments, public, visits

api_router = APIRouter()
api_router.include_router(public.router, prefix="/public", tags=["公开接口"])
api_router.include_router(auth.router, prefix="/auth", tags=["用户认证"])
api_router.include_router(visits.router, prefix="/visits", tags=["预约"])
api_router.include_router(comments.router, prefix="/comments", tags=["评论"])
api_router.include_router(admin.router, prefix="/admin", tags=["后台管理"])

