"""
Public user profile routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app import crud, schemas


router = APIRouter()


@router.get("/{username}/public", response_model=dict)
async def get_public_profile(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get public profile of a user by username.
    Returns 404 if user doesn't exist or profile is private.
    """
    result = await crud.get_public_profile_by_username(db, username)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or profile is private"
        )

    user, profile = result

    return {
        "user": {
            "username": user.username,
            "createdAt": user.created_at.isoformat()
        },
        "profile": {
            "xp": profile.xp,
            "level": profile.level,
            "unlockedBadges": profile.unlocked_badges,
            "avatarUrl": profile.avatar_url,
            "bannerUrl": profile.banner_url,
            "cvConfig": profile.cv_config
        }
    }
