from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import asyncio
import googlemaps
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Ambulance Tracking System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google Maps client
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

# Store connected clients and ambulance data
connected_clients = set()
ambulance_data = {
    "current_location": None,
    "destination": None,
    "route": None
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        connected_clients.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        connected_clients.discard(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                await self.disconnect(connection)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Ambulance Tracking System API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/set-destination")
async def set_destination(destination: dict):
    """Set the destination coordinates for the ambulance"""
    try:
        # Validate destination coordinates
        if not all(key in destination for key in ['lat', 'lng']):
            return {"error": "Invalid destination format. Requires lat and lng"}

        ambulance_data["destination"] = destination

        # Calculate route if we have current location
        if ambulance_data["current_location"]:
            await calculate_route()

        # Broadcast update to all connected clients
        await manager.broadcast(json.dumps({
            "type": "destination_update",
            "data": destination
        }))

        return {"message": "Destination set successfully", "destination": destination}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/get-route")
async def get_route():
    """Get the current calculated route"""
    return {
        "route": ambulance_data.get("route"),
        "current_location": ambulance_data.get("current_location"),
        "destination": ambulance_data.get("destination")
    }

async def calculate_route():
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
            await manager.broadcast(json.dumps({
                "type": "route_update",
                "data": directions_result[0]
            }))

    except Exception as e:
        print(f"Error calculating route: {e}")

@app.websocket("/ws/location")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive location data from hardware/ambulance
            data = await websocket.receive_text()
            location_data = json.loads(data)

            # Update current location
            ambulance_data["current_location"] = {
                "lat": location_data["lat"],
                "lng": location_data["lng"]
            }

            # Calculate route if destination is set
            if ambulance_data["destination"]:
                await calculate_route()

            # Broadcast location update to all connected clients
            await manager.broadcast(json.dumps({
                "type": "location_update",
                "data": ambulance_data["current_location"]
            }))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
