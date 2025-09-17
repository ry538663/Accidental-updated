import React, { useState } from 'react';
import { unitAPI } from '../services/api';

interface Incident {
  id: number;
  type: string;
  location: string;
  priority: string;
  status: string;
  reported_at: string;
}

interface IncidentListProps {
  incidents: Incident[];
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents }) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('reported_at');

  if (!incidents || incidents.length === 0) {
    return (
      <div className="incident-list-container">
        <div className="incident-list-header">
          <h2>🚨 Emergency Incidents</h2>
          <p className="incident-subtitle">Real-time incident monitoring</p>
        </div>
        <div className="no-incidents">
          <div className="no-incidents-icon">📋</div>
          <h3>No incidents reported yet</h3>
          <p>All emergency incidents will appear here in real-time</p>
        </div>
      </div>
    );
  }

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    return incident.priority.toLowerCase() === filter.toLowerCase();
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'reported_at':
        return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return '🟢';
      case 'IN_PROGRESS': return '🟡';
      case 'RESOLVED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '⚪';
    }
  };

  const handleViewDetails = (incident: Incident) => {
    alert(`Incident #${incident.id}\nType: ${incident.type}\nLocation: ${incident.location}\nPriority: ${incident.priority}\nStatus: ${incident.status}`);
  };

  const handleAssignUnit = async (incident: Incident) => {
    const unitId = window.prompt('Enter Unit ID to assign (e.g., UNIT-001):');
    if (!unitId) return;
    try {
      await unitAPI.update(unitId, { assigned_incident_id: incident.id, status: 'EN_ROUTE' });
      alert(`Unit ${unitId} assigned to incident #${incident.id}`);
    } catch (error) {
      console.error('Failed to assign unit:', error);
      alert('Failed to assign unit. Please verify the Unit ID and try again.');
    }
  };

  return (
    <div className="incident-list-container">
      <div className="incident-list-header">
        <div className="header-content">
          <h2>🚨 Emergency Incidents</h2>
          <p className="incident-subtitle">Real-time incident monitoring</p>
        </div>
        <div className="incident-count">
          <span className="count-number">{incidents.length}</span>
          <span className="count-label">Total Incidents</span>
        </div>
      </div>

      <div className="incident-controls">
        <div className="filter-controls">
          <label htmlFor="priority-filter">Filter by Priority:</label>
          <select 
            id="priority-filter"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="reported_at">Most Recent</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="incident-list">
        {sortedIncidents.map((incident) => (
          <div key={incident.id} className="incident-card">
            <div className="incident-card-header">
              <div className="incident-type">
                <span className="incident-icon">🚨</span>
                <h3>{incident.type}</h3>
              </div>
              <div className="incident-priority">
                <span className="priority-icon">{getPriorityIcon(incident.priority)}</span>
                <span className={`priority-badge priority-${incident.priority.toLowerCase()}`}>
                  {incident.priority}
                </span>
              </div>
            </div>
            
            <div className="incident-details">
              <div className="detail-row">
                <span className="detail-label">📍 Location:</span>
                <span className="detail-value">{incident.location}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">📊 Status:</span>
                <span className="status-badge">
                  <span className="status-icon">{getStatusIcon(incident.status)}</span>
                  {incident.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">⏰ Reported:</span>
                <span className="detail-value">
                  {new Date(incident.reported_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="incident-actions">
              <button className="action-btn primary" onClick={() => handleViewDetails(incident)}>View Details</button>
              <button className="action-btn secondary" onClick={() => handleAssignUnit(incident)}>Assign Unit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentList;
