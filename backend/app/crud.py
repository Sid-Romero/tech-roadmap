"""
CRUD operations for database models.
Async functions for all database interactions.
"""

import uuid
from typing import Optional, List
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import User, UserProfile, Project, WorkSession, ProjectStatus
from app.schemas import (
    UserCreate, ProjectCreate, ProjectUpdate,
    WorkSessionCreate, UserProfileUpdate
)
from app.core.security import get_password_hash, verify_password


def generate_id() -> str:
    """Generate a unique ID."""
    return str(uuid.uuid4())


# =============================================
# USER CRUD
# =============================================

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get user by ID."""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email."""
    result = await db.execute(
        select(User).where(User.email == email.lower())
    )
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username."""
    result = await db.execute(
        select(User).where(User.username == username.lower())
    )
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession,
    username: str,
    password: str
) -> Optional[User]:
    """Authenticate user by username/email and password."""
    # Try username first, then email
    user = await get_user_by_username(db, username)
    if not user:
        user = await get_user_by_email(db, username)
    
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """Create new user with profile."""
    user_id = generate_id()
    profile_id = generate_id()
    
    user = User(
        id=user_id,
        email=user_data.email.lower(),
        username=user_data.username.lower(),
        hashed_password=get_password_hash(user_data.password)
    )
    
    profile = UserProfile(
        id=profile_id,
        user_id=user_id,
        xp=0,
        level=1,
        unlocked_badges=[]
    )
    
    db.add(user)
    db.add(profile)
    await db.flush()
    
    return user


# =============================================
# USER PROFILE CRUD
# =============================================

async def get_profile_by_user_id(
    db: AsyncSession,
    user_id: str
) -> Optional[UserProfile]:
    """Get user profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_profile(
    db: AsyncSession,
    user_id: str,
    profile_data: UserProfileUpdate
) -> Optional[UserProfile]:
    """Update user profile."""
    profile = await get_profile_by_user_id(db, user_id)
    if not profile:
        return None
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    await db.flush()
    return profile


async def add_xp(db: AsyncSession, user_id: str, amount: int) -> Optional[UserProfile]:
    """Add XP to user profile."""
    profile = await get_profile_by_user_id(db, user_id)
    if not profile:
        return None
    
    profile.xp += amount
    await db.flush()
    return profile


# =============================================
# PROJECT CRUD
# =============================================

async def get_projects_by_user(
    db: AsyncSession,
    user_id: str
) -> List[Project]:
    """Get all projects for a user with sessions."""
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .options(selectinload(Project.sessions))
        .order_by(Project.level, Project.created_at)
    )
    return list(result.scalars().all())


async def get_project_by_id(
    db: AsyncSession,
    project_id: str,
    user_id: str
) -> Optional[Project]:
    """Get single project by ID (with user check)."""
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.user_id == user_id)
        .options(selectinload(Project.sessions))
    )
    return result.scalar_one_or_none()


async def create_project(
    db: AsyncSession,
    user_id: str,
    project_data: ProjectCreate
) -> Project:
    """Create new project."""
    project_id = project_data.id or f"custom_{generate_id()[:8]}"
    
    project = Project(
        id=project_id,
        user_id=user_id,
        title=project_data.title,
        level=project_data.level,
        status=ProjectStatus.LOCKED,
        category=project_data.category,
        description=project_data.description,
        position=project_data.position.model_dump(),
        dependencies=project_data.dependencies,
        tech_stack=project_data.tech_stack,
        complexity=project_data.complexity,
        priority=project_data.priority,
        checklist=[],
        resources=[]
    )
    
    db.add(project)
    await db.flush()
    
    # Check dependencies after creation
    await check_project_dependencies(db, user_id)
    
    return project


async def update_project(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    project_data: ProjectUpdate
) -> Optional[Project]:
    """Update existing project."""
    project = await get_project_by_id(db, project_id, user_id)
    if not project:
        return None
    
    update_data = project_data.model_dump(exclude_unset=True, by_alias=False)
    
    # Handle nested objects
    if "position" in update_data and update_data["position"]:
        update_data["position"] = update_data["position"].model_dump() if hasattr(update_data["position"], "model_dump") else update_data["position"]
    
    if "checklist" in update_data and update_data["checklist"]:
        update_data["checklist"] = [
            item.model_dump() if hasattr(item, "model_dump") else item 
            for item in update_data["checklist"]
        ]
    
    if "resources" in update_data and update_data["resources"]:
        update_data["resources"] = [
            item.model_dump() if hasattr(item, "model_dump") else item 
            for item in update_data["resources"]
        ]
    
    # Recalculate time from sessions if sessions exist
    if project.sessions:
        total_seconds = sum(s.duration_seconds for s in project.sessions)
        update_data["time_spent_hours"] = round(total_seconds / 3600, 1)
    
    for field, value in update_data.items():
        setattr(project, field, value)
    
    await db.flush()
    
    # Check dependencies after update
    await check_project_dependencies(db, user_id)
    
    return project


async def delete_project(
    db: AsyncSession,
    project_id: str,
    user_id: str
) -> bool:
    """Delete project and clean up dependencies."""
    project = await get_project_by_id(db, project_id, user_id)
    if not project:
        return False
    
    # Remove from other projects' dependencies
    await db.execute(
        update(Project)
        .where(Project.user_id == user_id)
        .values(
            dependencies=Project.dependencies  # This will be handled in Python
        )
    )
    
    # Actually need to handle JSON array update - do it manually
    all_projects = await get_projects_by_user(db, user_id)
    for p in all_projects:
        if project_id in p.dependencies:
            p.dependencies = [d for d in p.dependencies if d != project_id]
    
    await db.delete(project)
    await db.flush()
    
    # Recheck dependencies
    await check_project_dependencies(db, user_id)
    
    return True


async def check_project_dependencies(db: AsyncSession, user_id: str) -> None:
    """
    Check and update project statuses based on dependencies.
    Mirrors frontend checkDependencies function.
    """
    projects = await get_projects_by_user(db, user_id)
    completed_ids = {p.id for p in projects if p.status == ProjectStatus.DONE}
    
    for project in projects:
        if project.status in [ProjectStatus.DONE, ProjectStatus.IN_PROGRESS]:
            continue
        
        all_deps_met = all(dep_id in completed_ids for dep_id in project.dependencies)
        
        if all_deps_met and project.status == ProjectStatus.LOCKED:
            project.status = ProjectStatus.UNLOCKED
        elif not all_deps_met and project.status == ProjectStatus.UNLOCKED:
            project.status = ProjectStatus.LOCKED
    
    await db.flush()


# =============================================
# WORK SESSION CRUD
# =============================================

async def add_session_to_project(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    session_data: WorkSessionCreate
) -> Optional[WorkSession]:
    """Add work session to project."""
    project = await get_project_by_id(db, project_id, user_id)
    if not project:
        return None
    
    session = WorkSession(
        id=generate_id(),
        project_id=project_id,
        start_time=session_data.start_time,
        end_time=session_data.end_time,
        duration_seconds=session_data.duration_seconds,
        type=session_data.type,
        notes=session_data.notes,
        task_id=session_data.task_id
    )
    
    db.add(session)
    await db.flush()
    
    # Update project time
    total_seconds = sum(s.duration_seconds for s in project.sessions) + session_data.duration_seconds
    project.time_spent_hours = round(total_seconds / 3600, 1)
    
    await db.flush()
    return session


async def get_sessions_by_project(
    db: AsyncSession,
    project_id: str,
    user_id: str
) -> List[WorkSession]:
    """Get all sessions for a project."""
    project = await get_project_by_id(db, project_id, user_id)
    if not project:
        return []
    
    result = await db.execute(
        select(WorkSession)
        .where(WorkSession.project_id == project_id)
        .order_by(WorkSession.start_time.desc())
    )
    return list(result.scalars().all())


# =============================================
# SEED DATA
# =============================================

async def seed_initial_projects(db: AsyncSession, user_id: str) -> List[Project]:
    """Seed initial projects from constants for new user."""
    from app.constants import INITIAL_DATASET
    
    projects = []
    for project_data in INITIAL_DATASET:
        project = Project(
            id=project_data["id"],
            user_id=user_id,
            title=project_data["title"],
            level=project_data["level"],
            status=ProjectStatus(project_data["status"]),
            category=project_data["category"],
            position=project_data["position"],
            dependencies=project_data["dependencies"],
            description=project_data["description"],
            tech_stack=project_data["tech_stack"],
            complexity=project_data.get("complexity"),
            notes=project_data.get("notes"),
            time_spent_hours=project_data.get("time_spent_hours", 0),
            checklist=[],
            resources=[]
        )
        db.add(project)
        projects.append(project)
    
    await db.flush()
    return projects
