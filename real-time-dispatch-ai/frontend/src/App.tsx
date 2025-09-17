import React, { useState, useEffect } from 'react';
import IncidentList from './components/IncidentList';
import IncidentForm from './components/IncidentForm';
import EmergencyIncidentForm from './components/EmergencyIncidentForm';
import IncidentMap from './components/IncidentMap';
import Layout from './components/Layout';
import { incidentAPI } from './services/api';
import './App.css';
import UnitList from './components/UnitList';

interface Incident {
  id: number;
  type: string;
  location: string;
  priority: string;
  status: string;
  reported_at: string;
}

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await incidentAPI.getAll();
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewIncident = () => {
    // Refetch incidents after a new one is created
    fetchIncidents();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="App">
        <header className="App-header">
          <h1>Emergency Dispatch System</h1>
        </header>
        <main>
          
          <div className="map-section">
            <IncidentMap incidents={incidents} />
          </div>


          <div className="container">
            <div className="form-section">
              <EmergencyIncidentForm onIncidentCreated={handleNewIncident} />
            </div>
            <div className="list-section">
              <IncidentList incidents={incidents} />
            </div>
          </div>
          <div className="container">
          <UnitList />
        </div>
        </main>
      </div>
    </Layout>
  );
}

export default App;