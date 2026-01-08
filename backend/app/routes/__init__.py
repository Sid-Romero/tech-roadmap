"""API Routes"""

from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.profile import router as profile_router
from app.routes.users import router as users_router

__all__ = ["auth_router", "projects_router", "profile_router", "users_router"]
