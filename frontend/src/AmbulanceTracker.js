import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function AmbulanceTracker() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [ambulanceStatus, setAmbulanceStatus] = useState('disconnected');
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const wsRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (window.google && !googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });
      }
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD9K01CFg61CxQLM0w81PxTHrpos1CqzGQ&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8000/ws/location');

      wsRef.current.onopen = () => {
        setWsConnected(true);
        setAmbulanceStatus('connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onclose = () => {
        setWsConnected(false);
        setAmbulanceStatus('disconnected');
      };

      wsRef.current.onerror = () => {
        setWsConnected(false);
        setAmbulanceStatus('error');
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
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
    if (!googleMapRef.current || !position) return;

    const markerId = `${type}-marker`;
    let marker = window.markers ? window.markers[markerId] : null;

    if (marker) {
      marker.setPosition(position);
    } else {
      const icon = type === 'ambulance' ? '🚑' : '🏥';
      marker = new window.google.maps.Marker({
        position: position,
        map: googleMapRef.current,
        title: type === 'ambulance' ? 'Ambulance' : 'Destination',
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <text y="30" font-size="30">${icon}</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        }
      });

      if (!window.markers) window.markers = {};
      window.markers[markerId] = marker;
    }
  };

  const drawRoute = (routeData) => {
    if (!googleMapRef.current || !routeData) return;

    // Clear existing route
    if (window.routePolyline) {
      window.routePolyline.setMap(null);
    }

    // Draw new route
    const path = window.google.maps.geometry.encoding.decodePath(
      routeData.overview_polyline.points
    );

    window.routePolyline = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: googleMapRef.current
    });

    // Fit map to show entire route
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    googleMapRef.current.fitBounds(bounds);
  };

  const setDestinationHandler = async () => {
    const lat = parseFloat(document.getElementById('dest-lat').value);
    const lng = parseFloat(document.getElementById('dest-lng').value);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
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
        alert('Destination set successfully!');
      } else {
        alert('Error setting destination');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getCurrentRoute = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/get-route');
      const data = await response.json();

      if (data.route) {
        setRoute(data.route);
        drawRoute(data.route);
      }
    } catch (error) {
      alert('Error getting route: ' + error.message);
    }
  };

  return (
    <div className="App">
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
            <h3>Set Destination</h3>
            <div className="input-group">
              <label>Latitude:</label>
              <input type="number" id="dest-lat" step="any" placeholder="28.6139" />
            </div>
            <div className="input-group">
              <label>Longitude:</label>
              <input type="number" id="dest-lng" step="any" placeholder="77.2090" />
            </div>
            <button onClick={setDestinationHandler} className="btn-primary">
              Set Destination
            </button>
          </div>

          <div className="control-section">
            <h3>Current Status</h3>
            <div className="status-info">
              <p><strong>Ambulance Location:</strong></p>
              <p>{currentLocation ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` : 'Not available'}</p>

              <p><strong>Destination:</strong></p>
              <p>{destination ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` : 'Not set'}</p>
            </div>
            <button onClick={getCurrentRoute} className="btn-secondary">
              Get Current Route
            </button>
          </div>
        </div>

        <div className="map-container">
          <div ref={mapRef} className="google-map" />
        </div>
      </div>

      <footer className="app-footer">
        <p>Ambulance Tracking System - Real-time location monitoring and route optimization</p>
      </footer>
    </div>
  );
}

export default AmbulanceTracker;
