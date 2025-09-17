import React, { useState } from 'react';
import { incidentAPI } from '../services/api';

interface EmergencyIncidentFormProps {
  onIncidentCreated: () => void;
}

interface EmergencyFormData {
  type: string;
  location: string;
  description: string;
  caller_name: string;
  caller_phone: string;
  patient_age?: string;
  patient_gender?: string;
  consciousness?: 'Conscious' | 'Unconscious' | 'Unknown';
  bleeding?: 'None' | 'Minor' | 'Severe' | 'Unknown';
  breathing?: 'Normal' | 'Difficulty' | 'Not breathing' | 'Unknown';
  hazards_present?: boolean;
}

const EmergencyIncidentForm: React.FC<EmergencyIncidentFormProps> = ({ onIncidentCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmergencyFormData>({
    type: 'Accident - Road',
    location: '',
    description: '',
    caller_name: '',
    caller_phone: '',
    patient_age: '',
    patient_gender: '',
    consciousness: 'Unknown',
    bleeding: 'Unknown',
    breathing: 'Unknown',
    hazards_present: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await incidentAPI.create(formData);
      alert('Emergency incident reported!');
      setFormData(prev => ({
        ...prev,
        location: '',
        description: '',
        caller_name: '',
        caller_phone: '',
        patient_age: '',
        patient_gender: '',
        consciousness: 'Unknown',
        bleeding: 'Unknown',
        breathing: 'Unknown',
        hazards_present: false,
      }));
      onIncidentCreated();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message = err.response?.data?.detail || 'Failed to submit emergency incident.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="incident-form">
      <h2>Emergency Report</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Incident Type</label>
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option>Accident - Road</option>
            <option>Medical Emergency</option>
            <option>Fire</option>
            <option>Crime</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Address or landmark"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Patient Age</label>
            <input name="patient_age" value={formData.patient_age} onChange={handleChange} placeholder="e.g., 35" />
          </div>
          <div className="form-group">
            <label>Patient Gender</label>
            <input name="patient_gender" value={formData.patient_gender} onChange={handleChange} placeholder="e.g., Male/Female" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Consciousness</label>
            <select name="consciousness" value={formData.consciousness} onChange={handleChange}>
              <option>Conscious</option>
              <option>Unconscious</option>
              <option>Unknown</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bleeding</label>
            <select name="bleeding" value={formData.bleeding} onChange={handleChange}>
              <option>None</option>
              <option>Minor</option>
              <option>Severe</option>
              <option>Unknown</option>
            </select>
          </div>
          <div className="form-group">
            <label>Breathing</label>
            <select name="breathing" value={formData.breathing} onChange={handleChange}>
              <option>Normal</option>
              <option>Difficulty</option>
              <option>Not breathing</option>
              <option>Unknown</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Hazards Present</label>
          <input
            type="checkbox"
            name="hazards_present"
            checked={!!formData.hazards_present}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief details of the emergency"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Caller Name</label>
            <input name="caller_name" value={formData.caller_name} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label>Caller Phone</label>
            <input name="caller_phone" value={formData.caller_phone} onChange={handleChange} placeholder="Optional" />
          </div>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Report Emergency'}
        </button>
      </form>
    </div>
  );
};

export default EmergencyIncidentForm;
