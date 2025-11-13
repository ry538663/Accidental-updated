"""add beds reservation fields

Revision ID: 0002_beds_reservation
Revises: 0001_add_incident_fields
Create Date: 2025-11-13 00:00:00.000001
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_beds_reservation'
down_revision = '0001_add_incident_fields'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('beds', sa.Column('is_reserved_for_incident', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('beds', sa.Column('reserved_incident_id', sa.Integer(), nullable=True))
    op.add_column('beds', sa.Column('reserved_expiry_time', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('beds','reserved_expiry_time')
    op.drop_column('beds','reserved_incident_id')
    op.drop_column('beds','is_reserved_for_incident')
