"""add soft delete columns to users table

Revision ID: soft_delete_001
Revises: ccdfa2f7c8c9
Create Date: 2026-04-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'soft_delete_001'
down_revision = 'ccdfa2f7c8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add soft delete columns
    op.add_column('users', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove soft delete columns
    op.drop_column('users', 'deleted_at')
    op.drop_column('users', 'is_deleted')
