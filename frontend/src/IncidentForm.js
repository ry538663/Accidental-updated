import React, { useState } from 'react';
import { incidentAPI } from './services/api'; // if IncidentForm.js is in src/
import './IncidentForm.css';



const IncidentForm = ({ onIncidentCreated }) => {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    caller_name: '',
    caller_phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await incidentAPI.create(formData);
      alert('Incident reported successfully!');
      // Reset form
      setFormData({
        type: '',
        location: '',
        description: '',
        caller_name: '',
        caller_phone: ''
      });
      // Notify parent component to refresh incidents
      onIncidentCreated();
    } catch (error) {
      console.error('Error reporting incident:', error);
      alert('Failed to report incident.');
    }
  };

  return (
    <div className="incident-form">
      <h2>Report New Incident</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type:</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Caller Name:</label>
          <input
            type="text"
            name="caller_name"
            value={formData.caller_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Caller Phone:</label>
          <input
            type="text"
            name="caller_phone"
            value={formData.caller_phone}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Report Incident</button>
      </form>
    </div>
  );
};

export default IncidentForm;
