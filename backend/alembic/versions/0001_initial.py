"""Initial migration - create all tables

Revision ID: 0001
Revises:
Create Date: 2026-01-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create user_profiles table
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('unlocked_badges', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('status', sa.Enum('locked', 'unlocked', 'in_progress', 'done', name='projectstatus'), nullable=False, server_default='locked'),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('position', sa.JSON(), nullable=False, server_default='{"x": 100, "y": 100}'),
        sa.Column('dependencies', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('tech_stack', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('checklist', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('resources', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('complexity', sa.Integer(), nullable=True),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', name='priority'), nullable=True, server_default='medium'),
        sa.Column('github_url', sa.String(500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('time_spent_hours', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create work_sessions table
    op.create_table(
        'work_sessions',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('project_id', sa.String(50), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('start_time', sa.Integer(), nullable=False),
        sa.Column('end_time', sa.Integer(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('type', sa.Enum('focus', 'pomodoro', 'manual', name='sessiontype'), nullable=False, server_default='focus'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('task_id', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('work_sessions')
    op.drop_table('projects')
    op.drop_table('user_profiles')
    op.drop_table('users')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS sessiontype')
    op.execute('DROP TYPE IF EXISTS priority')
    op.execute('DROP TYPE IF EXISTS projectstatus')
