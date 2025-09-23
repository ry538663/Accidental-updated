# 🚑 Ambulance Tracking System - Project Overview

## 📁 Project Structure & File Descriptions

### **Root Level Files**
- **package.json** - Project dependencies and scripts
- **package-lock.json** - Locked versions of dependencies
- **README.md** - Project documentation
- **.gitignore** - Files to ignore in git
- **start.bat** - Windows startup script

### **📂 src/ Directory - Core Application Files**

#### **Main Application Files**
1. **index.js** - Main entry point for the React application
2. **index_new.js** - Updated version of the main entry point
3. **App.js** - Main React component (original version)
4. **App_new.js** - Updated main React component 
5. **App_fixed.js** - Bug-fixed version of main component
6. **App_test.js** - Testing version of main component
7. **App_leaflet.js** - Leaflet map integration version

#### **Core Tracking Components**
8. **AmbulanceTracker_Leaflet.js** - **MAIN TRACKING COMPONENT** (Currently Active)
   - Real-time ambulance tracking with Leaflet maps
   - GPS location services
   - WebSocket communication
   - Real road routing with OSRM
   - Interactive map controls

9. **AmbulanceTracker_v2.js** - Previous version of tracking component
10. **MapTest.js** - Map testing and development component

#### **Styling Files**
11. **AmbulanceTracker_updated.css** - Main stylesheet for the application
12. **AmbulanceTracker.css** - Original styling file

### **📂 public/ Directory**
- Static assets, HTML files, and build outputs

### **📂 backend/ Directory**
- **requirements.txt** - Python dependencies for backend services

---

## 🎯 **MOST IMPORTANT CODE & CORE FEATURES**

### **1. Main Entry Point - index_new.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './AmbulanceTracker_updated.css';
import AmbulanceTracker from './AmbulanceTracker_Leaflet';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AmbulanceTracker />
  </React.StrictMode>
);
```
**Purpose**: Initializes the React app and renders the main tracking component

### **2. Core Tracking Component - AmbulanceTracker_Leaflet.js**

#### **🔑 Key State Variables (Lines 20-30)**
```javascript
const [currentLocation, setCurrentLocation] = useState(null);
const [destination, setDestination] = useState(null);
const [route, setRoute] = useState(null);
const [wsConnected, setWsConnected] = useState(false);
const [ambulanceStatus, setAmbulanceStatus] = useState('disconnected');
```
**Purpose**: Manages all critical application state

#### **🗺️ Map Initialization (Lines 32-50)**
```javascript
useEffect(() => {
  if (mapRef.current && !mapInstanceRef.current) {
    mapInstanceRef.current = L.map(mapRef.current).setView([28.6139, 77.2090], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }
  getDriverLocation();
}, []);
```
**Purpose**: Sets up Leaflet map with OpenStreetMap tiles

#### **📍 GPS Location Service (Lines 52-85)**
```javascript
const getDriverLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const driverLocation = { lat, lng };
        setCurrentLocation(driverLocation);
        updateMapMarker('ambulance', driverLocation);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
      },
      (error) => {
        console.error('❌ Error getting driver location:', error);
        alert('❌ Error getting your location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }
};
```
**Purpose**: Gets user's GPS location and sets it as ambulance location

#### **🔗 WebSocket Connection (Lines 87-115)**
```javascript
useEffect(() => {
  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/location');
    ws.onopen = () => {
      setWsConnected(true);
      setAmbulanceStatus('connected');
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    ws.onclose = () => {
      setWsConnected(false);
      setAmbulanceStatus('disconnected');
    };
  };
  connectWebSocket();
}, []);
```
**Purpose**: Establishes real-time communication with backend

#### **🚦 WebSocket Message Handler (Lines 117-135)**
```javascript
const handleWebSocketMessage = (data) => {
  switch (data.type) {
    case 'location_update':
      setCurrentLocation(data.data);
      updateMapMarker('ambulance', data.data);
      break;
    case 'destination_update':
      setDestination(data.data);
      updateMapMarker('destination', data.data);
      break;
    case 'route_update':
      setRoute(data.data);
      drawRoute(data.data);
      break;
  }
};
```
**Purpose**: Processes real-time updates from backend

#### **🛣️ REAL ROAD ROUTING - OSRM Integration (Lines 280-340)**
```javascript
const getCurrentRoute = async () => {
  // ... validation code ...

  try {
    const button = document.querySelector('.btn-secondary');
    const originalText = button.textContent;
    button.textContent = '🔄 Calculating Route...';
    button.disabled = true;

    // Use OSRM (Open Source Routing Machine) for real road routing
    const start = `${currentLocation.lng},${currentLocation.lat}`;
    const end = `${lng},${lat}`;

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=false`
    );

    const data = await response.json();
    const route = data.routes[0];
    const routeData = {
      distance: route.distance / 1000,
      duration: route.duration / 60,
      path: route.geometry.coordinates.map(coord => [coord[1], coord[0]])
    };

    setRoute(routeData);
    drawRoute(routeData);
    setDestination(patientLocation);
    updateMapMarker('destination', patientLocation);

    const hours = Math.floor(routeData.duration / 60);
    const minutes = Math.floor(routeData.duration % 60);
    const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    alert(`✅ Route calculated!\n📏 Distance: ${routeData.distance.toFixed(2)} km\n⏱️ Estimated time: ${timeString}\n🛣️ Via roads: Yes`);
  } catch (error) {
    // Fallback to straight line
  } finally {
    const button = document.querySelector('.btn-secondary');
    button.textContent = originalText;
    button.disabled = false;
  }
};
```
**Purpose**: Calculates real road routes using OSRM API (like Zomato/Swiggy)

#### **🎨 Route Drawing Function (Lines 200-230)**
```javascript
const drawRoute = (routeData) => {
  if (!mapInstanceRef.current || !routeData) return;

  if (routeLineRef.current) {
    mapInstanceRef.current.removeLayer(routeLineRef.current);
  }

  if (routeData.path && routeData.path.length > 0) {
    // Real road route (blue line)
    routeLineRef.current = L.polyline(routeData.path, {
      color: 'blue',
      weight: 6,
      opacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(mapInstanceRef.current);

    mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] });
  } else if (currentLocation && destination) {
    // Fallback straight line (red dashed)
    const latlngs = [[currentLocation.lat, currentLocation.lng], [destination.lat, destination.lng]];
    routeLineRef.current = L.polyline(latlngs, {
      color: 'red',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);
  }
};
```
**Purpose**: Renders routes on map (blue for real roads, red dashed for fallback)

#### **📍 Marker Management (Lines 137-175)**
```javascript
const updateMapMarker = (type, position) => {
  if (!mapInstanceRef.current || !position) return;

  const markerId = `${type}-marker`;
  if (markersRef.current[markerId]) {
    mapInstanceRef.current.removeLayer(markersRef.current[markerId]);
  }

  let icon, title;
  if (type === 'ambulance') {
    icon = '🚑';
    title = 'Ambulance';
  } else {
    icon = '🏥';
    title = 'Destination';
  }

  const customIcon = L.divIcon({
    html: `<div style="font-size: 24px;">${icon}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const marker = L.marker([position.lat, position.lng], {
    title: title,
    icon: customIcon
  }).addTo(mapInstanceRef.current);

  markersRef.current[markerId] = marker;
};
```
**Purpose**: Creates and manages ambulance (🚑) and destination (🏥) markers

### **3. Styling - AmbulanceTracker_updated.css**
```css
/* Key styles for layout and appearance */
.main-container { display: flex; }
.controls-panel { width: 300px; padding: 20px; }
.map-container { flex: 1; height: 600px; }
.status { padding: 5px 10px; border-radius: 5px; }
.status.connected { background-color: #d4edda; color: #155724; }
.status.disconnected { background-color: #f8d7da; color: #721c24; }
```

---

## 🚀 **HOW THE WHOLE SYSTEM WORKS**

### **1. Application Startup**
- `index_new.js` loads → renders `AmbulanceTracker` component
- Map initializes with Delhi coordinates
- GPS location is automatically requested

### **2. Real-time Tracking**
- WebSocket connects to backend server
- GPS location updates ambulance position
- Markers update in real-time on map

### **3. Route Calculation (Key Feature)**
- User enters patient coordinates
- **OSRM API** calculates real road route
- **Blue line** shows actual driving path
- Distance and time calculated accurately
- **Fallback** to straight line if API fails

### **4. User Interface**
- Left panel: Controls and status
- Right side: Interactive map
- Real-time status indicators
- Professional styling and UX

### **5. Key Features Working Together**
- **GPS Integration** → Real location tracking
- **WebSocket Communication** → Real-time updates
- **OSRM Routing** → Professional road navigation
- **Leaflet Maps** → Interactive mapping
- **React State Management** → Smooth UI updates

---

## 🎯 **MOST CRITICAL CODE SECTIONS**

1. **OSRM Route Calculation** (Lines 280-340) - The core routing feature
2. **GPS Location Service** (Lines 52-85) - Gets real ambulance location
3. **WebSocket Handler** (Lines 117-135) - Real-time communication
4. **Map Drawing Functions** (Lines 200-230) - Renders routes and markers
5. **State Management** (Lines 20-30) - Controls all application data

**The system now provides professional-grade ambulance tracking with real road routing, just like Zomato/Swiggy delivery tracking!** 🚑✨
