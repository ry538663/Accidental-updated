import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';

// Fix default marker icons in Leaflet (so markers appear correctly in Webpack/Cra)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Keep props compatible with existing usage in App.tsx
interface IncidentMapProps {
  incidents?: unknown[];
}

const SOCKET_SERVER_URL = 'http://localhost:8000';

const IncidentMap: React.FC<IncidentMapProps> = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current).setView([0, 0], 10);
    L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    leafletMapRef.current = map;

    // Initialize Socket.IO client
    const socket = io(SOCKET_SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('receive-location', (data: { id: string; latitude: number; longitude: number }) => {
      const { id, latitude, longitude } = data;
      if (!leafletMapRef.current) return;
      leafletMapRef.current.setView([latitude, longitude], 15);

      const existing = markersRef.current[id];
      if (existing) {
        existing.setLatLng([latitude, longitude]);
      } else {
        markersRef.current[id] = L.marker([latitude, longitude]).addTo(leafletMapRef.current);
      }
    });

    socket.on('user-disconnected', (id: string) => {
      const existing = markersRef.current[id];
      if (existing && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(existing);
        delete markersRef.current[id];
      }
    });

    // Geolocation watch to emit our own position
    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('send-location', { latitude, longitude });
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 2500 }
      );
    }

    // Cleanup
    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  return (
    <div className="incident-map-container">
      <div
        ref={mapContainerRef}
        style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      />
    </div>
  );
};

export default IncidentMap;