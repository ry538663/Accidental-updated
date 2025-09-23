import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AmbulanceTracker.css';

import Navbar from './Navbar';
import Footer from './Footer';
import IncidentForm from './IncidentForm';


// Fix for default markers in Leaflet with Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function AmbulanceTracker() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [ambulanceStatus, setAmbulanceStatus] = useState('disconnected');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLineRef = useRef(null);
  const watchIdRef = useRef(null);

  // Initialize Leaflet map and get current location
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map centered on Delhi initially
      mapInstanceRef.current = L.map(mapRef.current).setView([28.6139, 77.2090], 12);

      // Add OpenStreetMap tiles (free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      console.log('✅ Leaflet map initialized successfully');
    }

    // Get driver's current location and set as ambulance location
    getDriverLocation();
  }, []);

  const getDriverLocation = () => {
    if (navigator.geolocation) {
      console.log('📍 Getting driver location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const driverLocation = { lat, lng };

          console.log('✅ Driver location obtained:', driverLocation);
          setCurrentLocation(driverLocation);

          // Update map marker for ambulance
          updateMapMarker('ambulance', driverLocation);

          // Center map on driver's location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
          }

          // Note: WebSocket update will be handled by the WebSocket connection
          // when it receives the location data
        },
        (error) => {
          console.error('❌ Error getting driver location:', error);
          alert('❌ Error getting your location: ' + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.error('❌ Geolocation not supported');
      alert('❌ Geolocation is not supported by this browser.');
    }
  };

  // WebSocket connection (same as before)
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

      ws.onerror = () => {
        setWsConnected(false);
        setAmbulanceStatus('error');
      };
    };

    connectWebSocket();

    return () => {
      // Cleanup WebSocket on unmount
    };
  }, []);

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
      default:
        break;
    }
  };

  const updateMapMarker = (type, position) => {
    if (!mapInstanceRef.current || !position) return;

    const markerId = `${type}-marker`;

    // Remove existing marker
    if (markersRef.current[markerId]) {
      mapInstanceRef.current.removeLayer(markersRef.current[markerId]);
    }

    // Create new marker
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

  const drawRoute = (routeData) => {
    if (!mapInstanceRef.current || !routeData) return;

    // Clear existing route
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
    }

    if (routeData.path && routeData.path.length > 0) {
      // Use the actual route path from OSRM (road-based routing)
      routeLineRef.current = L.polyline(routeData.path, {
        color: 'blue',
        weight: 6,
        opacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(mapInstanceRef.current);

      // Fit map to show the complete route
      mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [20, 20] });
    } else if (currentLocation && destination) {
      // Fallback to straight line if no path data
      const latlngs = [
        [currentLocation.lat, currentLocation.lng],
        [destination.lat, destination.lng]
      ];

      routeLineRef.current = L.polyline(latlngs, {
        color: 'red',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10' // Dashed line to indicate it's not a real route
      }).addTo(mapInstanceRef.current);

      // Fit map to show the route
      mapInstanceRef.current.fitBounds(latlngs, { padding: [20, 20] });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          document.getElementById('dest-lat').value = lat.toFixed(6);
          document.getElementById('dest-lng').value = lng.toFixed(6);
          setIsGettingLocation(false);
          alert('✅ Current location set as destination!');
        },
        (error) => {
          setIsGettingLocation(false);
          alert('❌ Error getting location: ' + error.message);
        }
      );
    } else {
      alert('❌ Geolocation is not supported by this browser.');
    }
  };

  const setDestinationHandler = async () => {
    const lat = parseFloat(document.getElementById('dest-lat').value);
    const lng = parseFloat(document.getElementById('dest-lng').value);

    if (isNaN(lat) || isNaN(lng)) {
      alert('❌ Please enter valid coordinates');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/set-destination', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
      });

      if (response.ok) {
        alert('✅ Destination set successfully!');
      } else {
        alert('❌ Error setting destination');
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const getCurrentRoute = async () => {
    if (!currentLocation) {
      alert('❌ Ambulance location not available. Please wait for GPS to load.');
      return;
    }

    const lat = parseFloat(document.getElementById('dest-lat').value);
    const lng = parseFloat(document.getElementById('dest-lng').value);

    if (isNaN(lat) || isNaN(lng)) {
      alert('❌ Please enter valid patient coordinates first');
      return;
    }

    const patientLocation = { lat, lng };
    const button = document.querySelector('.btn-secondary');
    const originalText = button.textContent;

    try {
      // Show loading indicator
      button.textContent = '🔄 Calculating Route...';
      button.disabled = true;

      // Use OSRM (Open Source Routing Machine) for real road routing
      const start = `${currentLocation.lng},${currentLocation.lat}`;
      const end = `${lng},${lat}`;

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=false`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeData = {
          distance: route.distance / 1000, // Convert to kilometers
          duration: route.duration / 60, // Convert to minutes
          path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]) // GeoJSON to Leaflet format
        };

        setRoute(routeData);
        drawRoute(routeData);
        setDestination(patientLocation);
        updateMapMarker('destination', patientLocation);

        // Show route information
        const hours = Math.floor(routeData.duration / 60);
        const minutes = Math.floor(routeData.duration % 60);
        const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        alert(`✅ Route calculated!\n📏 Distance: ${routeData.distance.toFixed(2)} km\n⏱️ Estimated time: ${timeString}\n🛣️ Via roads: Yes`);
      } else {
        throw new Error('No route found');
      }

    } catch (error) {
      console.error('Route calculation error:', error);
      alert('❌ Error calculating route. Please check your internet connection and try again.');

      // Fallback to straight line route
      const routeData = {
        distance: calculateDistance(currentLocation, patientLocation),
        duration: calculateDuration(currentLocation, patientLocation),
        path: [currentLocation, patientLocation]
      };

      setRoute(routeData);
      drawRoute(routeData);
      setDestination(patientLocation);
      updateMapMarker('destination', patientLocation);

      alert(`✅ Fallback route calculated!\n📏 Distance: ${routeData.distance.toFixed(2)} km\n⏱️ Estimated time: ${routeData.duration.toFixed(0)} minutes\n⚠️ Straight line (no road data)`);
    } finally {
      // Reset button
      const button = document.querySelector('.btn-secondary');
      button.textContent = originalText;
      button.disabled = false;
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateDuration = (point1, point2) => {
    const distance = calculateDistance(point1, point2);
    // Assume average ambulance speed of 30 km/h
    return (distance / 30) * 60; // Convert to minutes
  };

  return (

    
    <div className="App">
          <Navbar />
      <header className="app-header">
        <h1>🚑 Ambulance Tracking System</h1>
        <div className="status-indicators">
          <div className={`status ${wsConnected ? 'connected' : 'disconnected'}`}>
            WebSocket: {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <div className={`status ${ambulanceStatus}`}>
            Ambulance: {ambulanceStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}
          </div>
        </div>
      </header>

      <div className="main-container">
        <div className="controls-panel">
          <div className="control-section">
            <h3>📍 Set Accident/Patient Location</h3>
            <div className="input-group">
              <label>Latitude:</label>
              <input type="number" id="dest-lat" step="any" placeholder="28.6139" />
            </div>
            <div className="input-group">
              <label>Longitude:</label>
              <input type="number" id="dest-lng" step="any" placeholder="77.2090" />
            </div>
            <div className="button-group">
              <button
                onClick={getCurrentLocation}
                className="btn-location"
                disabled={isGettingLocation}
              >
                {isGettingLocation ? '📍 Getting Location...' : '📍 Use My Location'}
              </button>
              <button onClick={setDestinationHandler} className="btn-primary">
                🚑 Set as Destination
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>📊 Current Status</h3>
            <div className="status-info">
              <p><strong>🚑 Ambulance Location:</strong></p>
              <p>{currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'Not available'}</p>

              <p><strong>🏥 Patient Location:</strong></p>
              <p>{destination ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` : 'Not set'}</p>
            </div>
            <button onClick={getCurrentRoute} className="btn-secondary">
              🗺️ Get Current Route
            </button>
          </div>

          <div className="control-section">
            <h3>📝 Instructions</h3>
            <div className="instructions">
              <p>1. 🚑 Your current location is automatically set as ambulance location</p>
              <p>2. 📍 Click "Use My Location" to set your current location as the patient site</p>
              <p>3. 🏥 Or manually enter the patient coordinates in the form</p>
              <p>4. 🗺️ The system will show the optimal route from ambulance to patient</p>
              <p>5. 📡 Real-time tracking will show ambulance movement</p>
            </div>
          </div>
        </div>
          

        <div className="map-container">
          <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
        </div>
      </div>
       <IncidentForm />
   
      <Footer />
      <footer className="app-footer">
        <p>Ambulance Tracking System - Real-time location monitoring and route optimization</p>
        <p><small>Powered by OpenStreetMap (No API Key Required)</small></p>
      </footer>
    </div>

  );
}

export default AmbulanceTracker;
