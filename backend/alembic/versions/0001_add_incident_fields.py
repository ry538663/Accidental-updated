"""add incident fields

Revision ID: 0001_add_incident_fields
Revises: 
Create Date: 2025-11-13 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_add_incident_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('incidents', sa.Column('patient_lat', sa.Float(), nullable=True))
    op.add_column('incidents', sa.Column('patient_lng', sa.Float(), nullable=True))
    op.add_column('incidents', sa.Column('assigned_ambulance_id', sa.String(length=50), nullable=True))
    op.add_column('incidents', sa.Column('assigned_hospital_id', sa.Integer(), nullable=True))
    op.add_column('incidents', sa.Column('emergency_level', sa.String(length=20), nullable=True))
    op.add_column('incidents', sa.Column('patient_condition_form', sa.JSON(), nullable=True))
    op.create_index('ix_incidents_patient_loc', 'incidents', ['patient_lat','patient_lng'])


def downgrade():
    op.drop_index('ix_incidents_patient_loc','incidents')
    op.drop_column('incidents','patient_condition_form')
    op.drop_column('incidents','emergency_level')
    op.drop_column('incidents','assigned_hospital_id')
    op.drop_column('incidents','assigned_ambulance_id')
    op.drop_column('incidents','patient_lng')
    op.drop_column('incidents','patient_lat')
