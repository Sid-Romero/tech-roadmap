"""
SQLAlchemy models - mirrors frontend types.ts
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Text,
    ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


# ----------------- Enums -----------------
class ProjectStatus(str, enum.Enum):
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SessionType(str, enum.Enum):
    FOCUS = "focus"
    POMODORO = "pomodoro"
    MANUAL = "manual"


# ----------------- User Model -----------------
class User(Base):
    """User account for authentication."""
    
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    projects: Mapped[List["Project"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


# ----------------- User Profile (Gamification) -----------------
class UserProfile(Base):
    """User profile with XP and badges."""
    
    __tablename__ = "user_profiles"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    unlocked_badges: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Timestamps
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="profile")


# ----------------- Project Model -----------------
class Project(Base):
    """Main project entity matching frontend Project type."""
    
    __tablename__ = "projects"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    
    # Core fields
    title: Mapped[str] = mapped_column(String(255))
    level: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[ProjectStatus] = mapped_column(
        SQLEnum(ProjectStatus), default=ProjectStatus.LOCKED
    )
    category: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, default="")
    
    # Position for graph view (stored as JSON)
    position: Mapped[dict] = mapped_column(JSON, default={"x": 100, "y": 100})
    
    # Arrays stored as JSON
    dependencies: Mapped[List[str]] = mapped_column(JSON, default=list)
    tech_stack: Mapped[List[str]] = mapped_column(JSON, default=list)
    checklist: Mapped[List[dict]] = mapped_column(JSON, default=list)
    resources: Mapped[List[dict]] = mapped_column(JSON, default=list)
    
    # Optional fields
    complexity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    priority: Mapped[Optional[Priority]] = mapped_column(
        SQLEnum(Priority), nullable=True, default=Priority.MEDIUM
    )
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    time_spent_hours: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="projects")
    sessions: Mapped[List["WorkSession"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


# ----------------- Work Session Model -----------------
class WorkSession(Base):
    """Time tracking sessions for projects."""
    
    __tablename__ = "work_sessions"
    
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    project_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    
    start_time: Mapped[int] = mapped_column(Integer)  # Unix timestamp ms
    end_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    
    type: Mapped[SessionType] = mapped_column(
        SQLEnum(SessionType), default=SessionType.FOCUS
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    task_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    # Relationships
    project: Mapped["Project"] = relationship(back_populates="sessions")
