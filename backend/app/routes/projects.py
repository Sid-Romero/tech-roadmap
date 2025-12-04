"""
Project routes: CRUD operations for projects
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app import crud, schemas

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=List[schemas.ProjectResponse],
    summary="Get all projects"
)
async def get_projects(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all projects for the authenticated user.
    Includes work sessions for each project.
    """
    projects = await crud.get_projects_by_user(db, user_id)
    return projects


@router.get(
    "/{project_id}",
    response_model=schemas.ProjectResponse,
    summary="Get single project"
)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific project by ID.
    """
    project = await crud.get_project_by_id(db, project_id, user_id)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.post(
    "",
    response_model=schemas.ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new project"
)
async def create_project(
    project_data: schemas.ProjectCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new project.
    Automatically checks dependencies to set initial status.
    """
    project = await crud.create_project(db, user_id, project_data)
    return project


@router.put(
    "/{project_id}",
    response_model=schemas.ProjectResponse,
    summary="Update project"
)
async def update_project(
    project_id: str,
    project_data: schemas.ProjectUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing project.
    Only provided fields will be updated.
    Automatically rechecks all project dependencies.
    """
    project = await crud.update_project(db, project_id, user_id, project_data)
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.delete(
    "/{project_id}",
    response_model=schemas.MessageResponse,
    summary="Delete project"
)
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a project.
    Also removes project from other projects' dependencies.
    """
    success = await crud.delete_project(db, project_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return schemas.MessageResponse(message="Project deleted successfully")


# ----------------- Work Sessions -----------------

@router.post(
    "/{project_id}/sessions",
    response_model=schemas.WorkSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add work session"
)
async def add_session(
    project_id: str,
    session_data: schemas.WorkSessionCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a work session to a project.
    Automatically updates project's total time spent.
    """
    session = await crud.add_session_to_project(
        db, project_id, user_id, session_data
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return session


@router.get(
    "/{project_id}/sessions",
    response_model=List[schemas.WorkSessionResponse],
    summary="Get project sessions"
)
async def get_sessions(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all work sessions for a project.
    """
    sessions = await crud.get_sessions_by_project(db, project_id, user_id)
    return sessions
