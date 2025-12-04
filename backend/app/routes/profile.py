"""
Profile routes: user profile and gamification
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app import crud, schemas
from app.constants import get_rank_for_xp, get_next_level_xp, RANKS, BADGES
from app.models import ProjectStatus

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get(
    "",
    response_model=schemas.UserProfileResponse,
    summary="Get user profile"
)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's profile (XP, level, badges).
    """
    profile = await crud.get_profile_by_user_id(db, user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.put(
    "",
    response_model=schemas.UserProfileResponse,
    summary="Update profile"
)
async def update_profile(
    profile_data: schemas.UserProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user profile fields.
    """
    profile = await crud.update_profile(db, user_id, profile_data)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.post(
    "/xp",
    response_model=schemas.UserProfileResponse,
    summary="Add XP"
)
async def add_xp(
    xp_data: schemas.AddXPRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Add XP to user profile.
    """
    profile = await crud.add_xp(db, user_id, xp_data.amount)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.get(
    "/stats",
    response_model=schemas.UserStats,
    summary="Get computed stats"
)
async def get_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get computed user statistics.
    Includes rank, progress, project counts.
    """
    profile = await crud.get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    projects = await crud.get_projects_by_user(db, user_id)
    completed = len([p for p in projects if p.status == ProjectStatus.DONE])
    total = len(projects)
    
    rank = get_rank_for_xp(profile.xp)
    next_xp = get_next_level_xp(profile.level)
    
    # Calculate XP needed for current level
    current_level_xp = get_next_level_xp(profile.level - 1) if profile.level > 1 else 0
    
    return schemas.UserStats(
        xp=profile.xp,
        level=profile.level,
        completed_projects=completed,
        total_projects=total,
        rank_title=rank["title"],
        next_level_xp=next_xp,
        current_level_xp=current_level_xp
    )


# ----------------- Constants Endpoints -----------------

@router.get(
    "/ranks",
    summary="Get all ranks"
)
async def get_ranks():
    """
    Get list of all available ranks.
    """
    return RANKS


@router.get(
    "/badges",
    summary="Get all badges"
)
async def get_badges():
    """
    Get list of all available badges.
    """
    return BADGES
