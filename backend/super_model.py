from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Incident(db.Model):
    __tablename__ = 'incidents'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location_text = db.Column(db.String(255), nullable=True)

    # Patient GPS (from hardware)
    patient_lat = db.Column(db.Float, nullable=True, index=True)
    patient_lng = db.Column(db.Float, nullable=True, index=True)
    hardware_sensor_id = db.Column(db.String(100), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)

    # Caller
    caller_name = db.Column(db.String(100), nullable=True)
    caller_phone = db.Column(db.String(20), nullable=True)

    # Workflow Links
    assigned_ambulance_id = db.Column(db.String(50), nullable=True, index=True)
    assigned_hospital_id = db.Column(db.Integer, nullable=True, index=True)

    # Severity & timing
    emergency_level = db.Column(db.String(20), default='medium', index=True)
    estimated_arrival_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    status = db.Column(db.String(50), default='reported', index=True)

    # JSON form and audit
    patient_condition_form = db.Column(db.JSON, nullable=True)
    hospital_sync_status = db.Column(db.String(20), default='pending')

    alert_sent_family = db.Column(db.Boolean, default=False)
    alert_sent_police = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'location_text': self.location_text,
            'patient_lat': self.patient_lat,
            'patient_lng': self.patient_lng,
            'assigned_ambulance_id': self.assigned_ambulance_id,
            'assigned_hospital_id': self.assigned_hospital_id,
            'emergency_level': self.emergency_level,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AmbulanceData(db.Model):
    __tablename__ = 'ambulance_data'

    id = db.Column(db.Integer, primary_key=True)
    ambulance_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    driver_name = db.Column(db.String(100), nullable=True)
    driver_phone = db.Column(db.String(20), nullable=True)

    current_location_lat = db.Column(db.Float, nullable=True, index=True)
    current_location_lng = db.Column(db.Float, nullable=True, index=True)
    destination_lat = db.Column(db.Float, nullable=True)
    destination_lng = db.Column(db.Float, nullable=True)

    speed = db.Column(db.Float, nullable=True)
    fuel_level = db.Column(db.Float, nullable=True)
    device_battery = db.Column(db.Float, nullable=True)

    distance_to_patient = db.Column(db.Float, nullable=True)
    distance_to_hospital = db.Column(db.Float, nullable=True)
    eta_patient = db.Column(db.DateTime, nullable=True)
    eta_hospital = db.Column(db.DateTime, nullable=True)

    is_available = db.Column(db.Boolean, default=True, index=True)
    last_ping_time = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    route_data = db.Column(db.Text, nullable=True)  # store as JSON string
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'ambulance_id': self.ambulance_id,
            'current_location': {'lat': self.current_location_lat, 'lng': self.current_location_lng},
            'is_available': self.is_available,
            'last_ping_time': self.last_ping_time.isoformat() if self.last_ping_time else None
        }
