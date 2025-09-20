# 🚑 Ambulance Tracking System

A real-time ambulance tracking system with FastAPI backend and React frontend that displays live ambulance locations and calculates optimal routes using Google Maps API.

## Features

- **Real-time Location Tracking**: WebSocket-based live location updates from ambulance hardware
- **Google Maps Integration**: Interactive map with ambulance and destination markers
- **Route Optimization**: Automatic shortest path calculation using Google Maps Directions API
- **Live Status Monitoring**: Real-time connection status and ambulance availability
- **Destination Management**: Set and update destination coordinates dynamically
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
ambulance-tracking-system/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   └── ambulance-tracker/  # React application
│       ├── src/
│       │   ├── AmbulanceTracker.js  # Main component
│       │   ├── AmbulanceTracker.css # Styling
│       │   └── App.js              # App entry point
│       ├── public/
│       └── package.json
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- Google Maps API Key (with Maps JavaScript API and Directions API enabled)

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your Google Maps API key in `backend/.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Start the FastAPI server:
   ```bash
   python main.py
   ```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

1. Navigate to the React app directory:
   ```bash
   cd frontend/ambulance-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## Usage

### Setting Up Destinations

1. Open the application in your browser
2. In the "Set Destination" panel, enter the destination coordinates:
   - Latitude (e.g., 28.6139)
   - Longitude (e.g., 77.2090)
3. Click "Set Destination" to update the destination

### Monitoring Ambulance

1. The system will automatically connect to the ambulance via WebSocket
2. Real-time location updates will be displayed on the map
3. The route will be automatically calculated and displayed when both ambulance location and destination are available

### API Endpoints

- `GET /` - Health check
- `GET /health` - System status
- `POST /api/set-destination` - Set destination coordinates
- `GET /api/get-route` - Get current route information
- `WebSocket /ws/location` - Real-time location updates

## Hardware Integration

To send location data from ambulance hardware:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/location');

ws.onopen = function() {
    // Send location data periodically
    setInterval(() => {
        const location = {
            lat: current_latitude,
            lng: current_longitude
        };
        ws.send(JSON.stringify(location));
    }, 1000); // Update every second
};
```

## Development

### Backend Development

The FastAPI backend provides:
- WebSocket endpoint for real-time communication
- REST API for destination management
- Google Maps integration for route calculation
- CORS middleware for frontend access

### Frontend Development

The React frontend features:
- Google Maps JavaScript API integration
- Real-time WebSocket communication
- Responsive UI components
- Modern CSS styling

## Deployment

### Backend Deployment

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Run with: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Frontend Deployment

1. Build the application: `npm run build`
2. Serve the build files from your web server

## Troubleshooting

### Common Issues

1. **Google Maps not loading**: Check if your API key is valid and has the required APIs enabled
2. **WebSocket connection failed**: Ensure the backend is running on port 8000
3. **CORS errors**: The backend is configured to allow all origins in development

### Debug Mode

Enable debug logging by setting the log level:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.
