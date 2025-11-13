# Alembic migration snippets for common changes (examples)

from alembic import op
import sqlalchemy as sa

# add patient lat/lng and assigned_ambulance_id to incidents
def upgrade_add_incident_fields():
    op.add_column('incidents', sa.Column('patient_lat', sa.Float(), nullable=True))
    op.add_column('incidents', sa.Column('patient_lng', sa.Float(), nullable=True))
    op.add_column('incidents', sa.Column('assigned_ambulance_id', sa.String(length=50), nullable=True))
    op.create_index('ix_incidents_patient_loc', 'incidents', ['patient_lat','patient_lng'])

def downgrade_add_incident_fields():
    op.drop_index('ix_incidents_patient_loc','incidents')
    op.drop_column('incidents','assigned_ambulance_id')
    op.drop_column('incidents','patient_lng')
    op.drop_column('incidents','patient_lat')

# add reservation fields to beds (Django raw SQL example)
def upgrade_beds_add_reservation():
    op.execute("""
    ALTER TABLE beds ADD COLUMN is_reserved_for_incident boolean DEFAULT false;
    ALTER TABLE beds ADD COLUMN reserved_incident_id integer;
    ALTER TABLE beds ADD COLUMN reserved_expiry_time timestamp with time zone;
    """)

def downgrade_beds_add_reservation():
    op.execute("""
    ALTER TABLE beds DROP COLUMN reserved_expiry_time;
    ALTER TABLE beds DROP COLUMN reserved_incident_id;
    ALTER TABLE beds DROP COLUMN is_reserved_for_incident;
    """)
