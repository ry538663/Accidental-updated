import React, { useEffect, useRef, useState } from 'react';

function MapTest() {
  const mapRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = () => {
      try {
        if (window.google && mapRef.current) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 28.6139, lng: 77.2090 },
            zoom: 12,
          });
          setMapStatus('Map loaded successfully!');
          console.log('✅ Google Maps loaded successfully');
        } else {
          setError('Google Maps API not available');
        }
      } catch (err) {
        setError(`Error initializing map: ${err.message}`);
        console.error('❌ Map initialization error:', err);
      }
    };

    const loadGoogleMapsAPI = () => {
      if (window.google) {
        console.log('✅ Google Maps API already loaded');
        initMap();
        return;
      }

      console.log('🔄 Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD9K01CFg61CxQLM0w81PxTHrpos1CqzGQ&libraries=places';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Google Maps API script loaded');
        initMap();
      };

      script.onerror = () => {
        setError('Failed to load Google Maps API script');
        console.error('❌ Failed to load Google Maps API script');
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🗺️ Google Maps Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong> {mapStatus}
      </div>
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f0f0f0'
        }}
      />
    </div>
  );
}

export default MapTest;
