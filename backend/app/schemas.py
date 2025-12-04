"""
Pydantic schemas for request/response validation.
Mirrors frontend types.ts structure.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum


# ----------------- Enums -----------------
class ProjectStatus(str, Enum):
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SessionType(str, Enum):
    FOCUS = "focus"
    POMODORO = "pomodoro"
    MANUAL = "manual"


# ----------------- Coordinates -----------------
class Coordinates(BaseModel):
    x: float
    y: float


# ----------------- SubTask -----------------
class SubTask(BaseModel):
    id: str
    text: str
    isCompleted: bool = Field(alias="is_completed", default=False)
    
    class Config:
        populate_by_name = True


class SubTaskCreate(BaseModel):
    text: str
    isCompleted: bool = False


# ----------------- Resource -----------------
class Resource(BaseModel):
    id: str
    label: str
    url: str


class ResourceCreate(BaseModel):
    label: str
    url: str


# ----------------- Work Session -----------------
class WorkSessionBase(BaseModel):
    start_time: int = Field(alias="startTime")
    end_time: Optional[int] = Field(None, alias="endTime")
    duration_seconds: int = Field(alias="durationSeconds")
    type: SessionType
    notes: Optional[str] = None
    task_id: Optional[str] = Field(None, alias="taskId")
    
    class Config:
        populate_by_name = True


class WorkSessionCreate(WorkSessionBase):
    pass


class WorkSessionResponse(WorkSessionBase):
    id: str
    
    class Config:
        from_attributes = True
        populate_by_name = True


# ----------------- Project Schemas -----------------
class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    level: int = Field(ge=1, le=10, default=1)
    category: str = Field(min_length=1, max_length=100)
    description: str = ""
    position: Coordinates = Coordinates(x=100, y=100)
    dependencies: List[str] = []
    tech_stack: List[str] = Field(default=[], alias="techStack")
    complexity: Optional[int] = Field(None, ge=1, le=5)
    priority: Optional[Priority] = Priority.MEDIUM
    
    class Config:
        populate_by_name = True


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    id: Optional[str] = None  # Auto-generated if not provided


class ProjectUpdate(BaseModel):
    """Schema for updating a project. All fields optional."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    level: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[ProjectStatus] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    position: Optional[Coordinates] = None
    dependencies: Optional[List[str]] = None
    tech_stack: Optional[List[str]] = Field(None, alias="techStack")
    complexity: Optional[int] = Field(None, ge=1, le=5)
    priority: Optional[Priority] = None
    checklist: Optional[List[SubTask]] = None
    resources: Optional[List[Resource]] = None
    github_url: Optional[str] = Field(None, alias="githubUrl", max_length=500)
    notes: Optional[str] = None
    time_spent_hours: Optional[float] = Field(None, alias="timeSpentHours", ge=0)
    completed_at: Optional[str] = Field(None, alias="completedAt")
    
    class Config:
        populate_by_name = True


class ProjectResponse(ProjectBase):
    """Full project response with all fields."""
    id: str
    status: ProjectStatus
    checklist: List[SubTask] = []
    resources: List[Resource] = []
    sessions: List[WorkSessionResponse] = []
    github_url: Optional[str] = Field(None, alias="githubUrl")
    notes: Optional[str] = None
    time_spent_hours: float = Field(0.0, alias="timeSpentHours")
    completed_at: Optional[str] = Field(None, alias="completedAt")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True


# ----------------- User Profile -----------------
class UserProfileBase(BaseModel):
    xp: int = 0
    level: int = 1
    unlocked_badges: List[str] = Field(default=[], alias="unlockedBadges")
    
    class Config:
        populate_by_name = True


class UserProfileUpdate(BaseModel):
    xp: Optional[int] = Field(None, ge=0)
    level: Optional[int] = Field(None, ge=1)
    unlocked_badges: Optional[List[str]] = Field(None, alias="unlockedBadges")
    
    class Config:
        populate_by_name = True


class UserProfileResponse(UserProfileBase):
    id: str
    user_id: str = Field(alias="userId")
    
    class Config:
        from_attributes = True
        populate_by_name = True


class AddXPRequest(BaseModel):
    amount: int = Field(ge=0)


# ----------------- Auth Schemas -----------------
class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8)
    
    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must be alphanumeric (underscores/dashes allowed)")
        return v.lower()


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True


class Token(BaseModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = Field(default="bearer", alias="tokenType")
    
    class Config:
        populate_by_name = True


class TokenPayload(BaseModel):
    sub: str
    exp: datetime


class LoginRequest(BaseModel):
    username: str  # Can be email or username
    password: str


# ----------------- User Stats (computed) -----------------
class UserStats(BaseModel):
    xp: int
    level: int
    completed_projects: int = Field(alias="completedProjects")
    total_projects: int = Field(alias="totalProjects")
    rank_title: str = Field(alias="rankTitle")
    next_level_xp: int = Field(alias="nextLevelXP")
    current_level_xp: int = Field(alias="currentLevelXP")
    
    class Config:
        populate_by_name = True


# ----------------- Generic Responses -----------------
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
