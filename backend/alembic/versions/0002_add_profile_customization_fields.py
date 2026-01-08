"""Add profile customization fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to user_profiles table
    op.add_column('user_profiles', sa.Column('avatar_url', sa.Text(), nullable=True))
    op.add_column('user_profiles', sa.Column('banner_url', sa.Text(), nullable=True))
    op.add_column('user_profiles', sa.Column('is_public', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user_profiles', sa.Column('show_in_progress', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user_profiles', sa.Column('show_personal_cv', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user_profiles', sa.Column('show_generated_cv', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('user_profiles', sa.Column('cv_config', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('user_profiles', 'cv_config')
    op.drop_column('user_profiles', 'show_generated_cv')
    op.drop_column('user_profiles', 'show_personal_cv')
    op.drop_column('user_profiles', 'show_in_progress')
    op.drop_column('user_profiles', 'is_public')
    op.drop_column('user_profiles', 'banner_url')
    op.drop_column('user_profiles', 'avatar_url')
