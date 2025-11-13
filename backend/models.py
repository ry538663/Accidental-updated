from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Incident(db.Model):
    __tablename__ = 'incidents'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    caller_name = db.Column(db.String(100), nullable=True)
    caller_phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='reported')

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'location': self.location,
            'description': self.description,
            'caller_name': self.caller_name,
            'caller_phone': self.caller_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'status': self.status
        }

class AmbulanceData(db.Model):
    __tablename__ = 'ambulance_data'

    id = db.Column(db.Integer, primary_key=True)
    current_location_lat = db.Column(db.Float, nullable=True)
    current_location_lng = db.Column(db.Float, nullable=True)
    destination_lat = db.Column(db.Float, nullable=True)
    destination_lng = db.Column(db.Float, nullable=True)
    route_data = db.Column(db.Text, nullable=True)  # JSON string for route
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'current_location': {
                'lat': self.current_location_lat,
                'lng': self.current_location_lng
            } if self.current_location_lat and self.current_location_lng else None,
            'destination': {
                'lat': self.destination_lat,
                'lng': self.destination_lng
            } if self.destination_lat and self.destination_lng else None,
            'route': self.route_data,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
