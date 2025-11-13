-- PostgreSQL index suggestions for the project

CREATE INDEX IF NOT EXISTS ix_incidents_patient_point ON incidents (patient_lat, patient_lng);
CREATE INDEX IF NOT EXISTS ix_incidents_status_created_at ON incidents (status, created_at);
CREATE INDEX IF NOT EXISTS ix_ambulance_is_available ON ambulance_data (ambulance_id) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS ix_ambulance_last_ping ON ambulance_data (last_ping_time);
CREATE INDEX IF NOT EXISTS ix_beds_hospital_is_occupied ON beds (hospital_id, is_occupied);
CREATE INDEX IF NOT EXISTS ix_emergencyincident_incident ON emergency_incidents (incident_id);

-- BRIN index example (time-series pings)
CREATE INDEX IF NOT EXISTS brin_ambulance_ping_time ON ambulance_data USING BRIN (last_ping_time);
