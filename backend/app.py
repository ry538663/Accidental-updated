from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json
import googlemaps
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables (supports .env and .env.local)
load_dotenv()

from backend.config import SQLALCHEMY_DATABASE_URI, SECRET_KEY, GOOGLE_MAPS_API_KEY
from backend.super_model import db, Incident

try:
    import redis
except Exception:
    redis = None

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY or os.getenv('FLASK_SECRET_KEY', 'change-me')
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI or os.getenv('POSTGRESQL_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app, origins=["*"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Google Maps client
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY or os.getenv("GOOGLE_MAPS_API_KEY"))

# initialize SQLAlchemy
db.init_app(app)

# Redis publisher (optional)
REDIS_URL = os.getenv('REDIS_URL')
redis_client = None
if redis and REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL)
    except Exception as e:
        print(f"Warning: cannot connect to Redis at {REDIS_URL}: {e}")

# Store connected clients and ambulance data
connected_clients = set()
ambulance_data = {
    "current_location": None, 
    "destination": None,
    "route": None
}

# note: incidents persisted to Postgres via SQLAlchemy (see create_incident endpoint)

@app.route("/")
def root():
    return {"message": "Ambulance Tracking System API", "status": "running"}

@app.route("/health")
def health_check():
    return {"status": "healthy"}

# Incident management endpoints
@app.route("/api/incidents", methods=["POST"])
def create_incident():
    """Create a new incident and persist to Postgres. Publish `incident.created` to Redis if configured."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # map incoming fields to model
    incident = Incident(
        type=data.get('type'),
        description=data.get('description'),
        location_text=data.get('location') or data.get('location_text'),
        caller_name=data.get('caller_name'),
        caller_phone=data.get('caller_phone'),
        patient_lat=data.get('patient_lat'),
        patient_lng=data.get('patient_lng'),
        hardware_sensor_id=data.get('hardware_sensor_id'),
        emergency_level=data.get('emergency_level', 'medium'),
        status=data.get('status', 'reported')
    )

    try:
        with app.app_context():
            db.session.add(incident)
            db.session.commit()
            incident_id = incident.id

            # publish minimal event to Redis if configured
            event_payload = {
                'incident_id': incident_id,
                'lat': incident.patient_lat,
                'lng': incident.patient_lng,
                'emergency_level': incident.emergency_level,
                'assigned_ambulance_id': incident.assigned_ambulance_id
            }
            if redis_client:
                try:
                    redis_client.publish('incident.created', json.dumps(event_payload))
                except Exception as e:
                    print(f"Warning: failed to publish to Redis: {e}")

            return jsonify({"message": "Incident created successfully", "incident_id": incident_id}), 201

    except Exception as e:
        # rollback on error
        with app.app_context():
            db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/incidents", methods=["GET"])
def get_incidents():
    """Get recent incidents from database (limited preview)"""
    try:
        with app.app_context():
            rows = Incident.query.order_by(Incident.created_at.desc()).limit(100).all()
            return jsonify({"incidents": [r.to_dict() for r in rows]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/incidents/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    """Get a specific incident from DB"""
    try:
        with app.app_context():
            inc = Incident.query.get(incident_id)
            if not inc:
                return jsonify({"error": "Incident not found"}), 404
            return jsonify({"incident": inc.to_dict()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/incidents/<int:incident_id>", methods=["PUT"])
def update_incident(incident_id):
    """Update an incident in DB (partial update)"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        with app.app_context():
            inc = Incident.query.get(incident_id)
            if not inc:
                return jsonify({"error": "Incident not found"}), 404

            for k, v in data.items():
                if hasattr(inc, k):
                    setattr(inc, k, v)

            db.session.commit()
            return jsonify({"message": "Incident updated successfully", "incident": inc.to_dict()})
    except Exception as e:
        with app.app_context():
            db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/incidents/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):
    """Delete an incident (DB)"""
    try:
        with app.app_context():
            inc = Incident.query.get(incident_id)
            if not inc:
                return jsonify({"error": "Incident not found"}), 404
            db.session.delete(inc)
            db.session.commit()
            return jsonify({"message": "Incident deleted successfully"})
    except Exception as e:
        with app.app_context():
            db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/set-destination", methods=["POST"])
def set_destination():
    """Set the destination coordinates for the ambulance"""
    try:
        destination = request.get_json()
        if not destination:
            return jsonify({"error": "No data provided"}), 400

        # Validate destination coordinates
        if not all(key in destination for key in ['lat', 'lng']):
            return jsonify({"error": "Invalid destination format. Requires lat and lng"}), 400

        ambulance_data["destination"] = destination

        # Calculate route if we have current location
        if ambulance_data["current_location"]:
            calculate_route()

        # Broadcast update to all connected clients
        socketio.emit('destination_update', destination)

        return jsonify({"message": "Destination set successfully", "destination": destination})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/get-route", methods=["GET"])
def get_route():
    """Get the current calculated route"""
    return jsonify({
        "route": ambulance_data.get("route"),
        "current_location": ambulance_data.get("current_location"),
        "destination": ambulance_data.get("destination")
    })

def calculate_route():
    """Calculate the route using Google Maps Directions API"""
    try:
        if not ambulance_data["current_location"] or not ambulance_data["destination"]:
            return

        # Get directions
        directions_result = gmaps.directions(
            ambulance_data["current_location"],
            ambulance_data["destination"],
            mode="driving",
            departure_time=datetime.now()
        )

        if directions_result:
            ambulance_data["route"] = directions_result[0]

            # Broadcast route update to all connected clients
            socketio.emit('route_update', directions_result[0])

    except Exception as e:
        print(f"Error calculating route: {e}")

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    connected_clients.add(request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    connected_clients.discard(request.sid)

@socketio.on('location_update')
def handle_location_update(data):
    """Handle location data from ambulance"""
    try:
        location_data = json.loads(data) if isinstance(data, str) else data

        # Update current location
        ambulance_data["current_location"] = {
            "lat": location_data["lat"],
            "lng": location_data["lng"]
        }

        # Calculate route if destination is set
        if ambulance_data["destination"]:
            calculate_route()

        # Broadcast location update to all connected clients
        emit('location_update', ambulance_data["current_location"], broadcast=True)

    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000, debug=True, allow_unsafe_werkzeug=True)
