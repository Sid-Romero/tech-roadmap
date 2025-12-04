"""
Database connection and session management.
Uses SQLAlchemy 2.0 async pattern.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


# ----------------- Engine Configuration -----------------
# Use NullPool for serverless/container environments
# Switch to default pool for long-running servers
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries in debug mode
    pool_pre_ping=True,   # Verify connections before use
    # For production with persistent connections:
    # pool_size=5,
    # max_overflow=10,
    # pool_timeout=30,
)

# ----------------- Session Factory -----------------
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ----------------- Base Model -----------------
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# ----------------- Dependencies -----------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    Automatically handles commit/rollback and cleanup.
    
    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ----------------- Lifecycle -----------------
async def init_db() -> None:
    """
    Initialize database tables.
    Called on application startup.
    
    Note: In production, use Alembic migrations instead!
    """
    async with engine.begin() as conn:
        # Import models to register them
        from app import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Close database connections.
    Called on application shutdown.
    """
    await engine.dispose()
