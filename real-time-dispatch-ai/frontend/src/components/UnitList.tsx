import React, { useState, useEffect } from 'react';
import { unitAPI } from '../services/api';

interface EmergencyUnit {
  id: number;
  unit_id: string;
  unit_type: string;
  status: string;
  current_location: string;
  last_updated: string;
  assigned_incident_id: number | null;
}

const UnitList: React.FC = () => {
  const [units, setUnits] = useState<EmergencyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('unit_id');

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setError(null);
      const response = await unitAPI.getAll();
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
      setError('Failed to load emergency units. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateUnitStatus = async (unitId: string, newStatus: string) => {
    try {
      await unitAPI.update(unitId, { status: newStatus });
      fetchUnits(); // Refresh the unit list
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Failed to update unit status. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE': return '🟢';
      case 'EN_ROUTE': return '🚗';
      case 'ON_SCENE': return '📍';
      case 'OFF_DUTY': return '🔴';
      default: return '⚪';
    }
  };

  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType.toUpperCase()) {
      case 'AMBULANCE': return '🚑';
      case 'FIRE_TRUCK': return '🚒';
      case 'POLICE': return '🚔';
      case 'RESCUE': return '🚁';
      default: return '🚨';
    }
  };

  const filteredUnits = units.filter(unit => {
    if (filter === 'all') return true;
    return unit.status.toLowerCase() === filter.toLowerCase();
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    switch (sortBy) {
      case 'unit_id':
        return a.unit_id.localeCompare(b.unit_id);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'unit_type':
        return a.unit_type.localeCompare(b.unit_type);
      default:
        return 0;
    }
  });

  const getStatusStats = () => {
    const stats = units.reduce((acc, unit) => {
      acc[unit.status] = (acc[unit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const statusStats = getStatusStats();

  if (loading) {
    return (
      <div className="unit-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading emergency units...</h3>
          <p>Please wait while we fetch the latest unit information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unit-list-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Units</h3>
          <p>{error}</p>
          <button onClick={fetchUnits} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-list-container">
      <div className="unit-list-header">
        <div className="header-content">
          <h2>🚨 Emergency Units</h2>
          <p className="unit-subtitle">Real-time unit status monitoring</p>
        </div>
        <div className="unit-count">
          <span className="count-number">{units.length}</span>
          <span className="count-label">Total Units</span>
        </div>
      </div>

      <div className="unit-stats">
        {Object.entries(statusStats).map(([status, count]) => (
          <div key={status} className={`stat-card status-${status.toLowerCase()}`}>
            <div className="stat-icon">{getStatusIcon(status)}</div>
            <div className="stat-number">{count}</div>
            <div className="stat-label">{status.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      <div className="unit-controls">
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select 
            id="status-filter"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="en_route">En Route</option>
            <option value="on_scene">On Scene</option>
            <option value="off_duty">Off Duty</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="unit-sort-select">Sort by:</label>
          <select 
            id="unit-sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="unit_id">Unit ID</option>
            <option value="status">Status</option>
            <option value="unit_type">Type</option>
          </select>
        </div>
      </div>

      <div className="units-container">
        {sortedUnits.map((unit) => (
          <div key={unit.id} className="unit-card">
            <div className="unit-card-header">
              <div className="unit-info">
                <div className="unit-type-icon">{getUnitTypeIcon(unit.unit_type)}</div>
                <div className="unit-details">
                  <h3 className="unit-id">{unit.unit_id}</h3>
                  <p className="unit-type">{unit.unit_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="unit-status">
                <span className="status-icon">{getStatusIcon(unit.status)}</span>
                <span className={`status-badge status-${unit.status.toLowerCase()}`}>
                  {unit.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="unit-details-section">
              <div className="detail-row">
                <span className="detail-label">📍 Location:</span>
                <span className="detail-value">{unit.current_location}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">⏰ Last Updated:</span>
                <span className="detail-value">
                  {new Date(unit.last_updated).toLocaleString()}
                </span>
              </div>
              
              {unit.assigned_incident_id && (
                <div className="detail-row">
                  <span className="detail-label">🎯 Assigned Incident:</span>
                  <span className="detail-value">#{unit.assigned_incident_id}</span>
                </div>
              )}
            </div>
            
            <div className="unit-actions">
              <label htmlFor={`status-${unit.id}`}>Update Status:</label>
              <select 
                id={`status-${unit.id}`}
                value={unit.status} 
                onChange={(e) => updateUnitStatus(unit.unit_id, e.target.value)}
                className="status-select"
              >
                <option value="AVAILABLE">🟢 Available</option>
                <option value="EN_ROUTE">🚗 En Route</option>
                <option value="ON_SCENE">📍 On Scene</option>
                <option value="OFF_DUTY">🔴 Off Duty</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitList;