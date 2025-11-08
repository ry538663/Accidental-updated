from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json
import googlemaps
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app, origins=["*"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Google Maps client
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

# Store connected clients and ambulance data
connected_clients = set()
ambulance_data = {
    "current_location": None,
    "destination": None,
    "route": None
}

# In-memory storage for incidents (in production, use a database)
incidents_db = []
incident_id_counter = 1

@app.route("/")
def root():
    return {"message": "Ambulance Tracking System API", "status": "running"}

@app.route("/health")
def health_check():
    return {"status": "healthy"}

# Incident management endpoints
@app.route("/api/incidents", methods=["POST"])
def create_incident():
    """Create a new incident"""
    global incident_id_counter

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    new_incident = {
        "id": incident_id_counter,
        "type": data.get("type"),
        "location": data.get("location"),
        "description": data.get("description"),
        "caller_name": data.get("caller_name"),
        "caller_phone": data.get("caller_phone"),
        "created_at": datetime.now().isoformat(),
        "status": "reported"
    }

    incidents_db.append(new_incident)
    incident_id_counter += 1

    return jsonify({"message": "Incident created successfully", "incident": new_incident})

@app.route("/api/incidents", methods=["GET"])
def get_incidents():
    """Get all incidents"""
    return jsonify({"incidents": incidents_db})

@app.route("/api/incidents/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):
    """Get a specific incident"""
    incident = next((inc for inc in incidents_db if inc["id"] == incident_id), None)
    if not incident:
        return jsonify({"error": "Incident not found"}), 404
    return jsonify({"incident": incident})

@app.route("/api/incidents/<int:incident_id>", methods=["PUT"])
def update_incident(incident_id):
    """Update an incident"""
    incident = next((inc for inc in incidents_db if inc["id"] == incident_id), None)
    if not incident:
        return jsonify({"error": "Incident not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Update only provided fields
    for field, value in data.items():
        if field in incident:
            incident[field] = value

    return jsonify({"message": "Incident updated successfully", "incident": incident})

@app.route("/api/incidents/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):
    """Delete an incident"""
    global incidents_db
    incident = next((inc for inc in incidents_db if inc["id"] == incident_id), None)
    if not incident:
        return jsonify({"error": "Incident not found"}), 404

    incidents_db = [inc for inc in incidents_db if inc["id"] != incident_id]
    return jsonify({"message": "Incident deleted successfully"})

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
