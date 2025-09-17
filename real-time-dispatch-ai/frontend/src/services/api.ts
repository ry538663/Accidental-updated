import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const incidentAPI = {
  getAll: () => api.get('/incidents'),
  create: (data: any) => api.post('/incidents', data),
};

export const unitAPI = {
  getAll: () => api.get('/units'),
  create: (data: any) => api.post('/units', data),
  update: (unitId: string, data: any) => api.put(`/units/${unitId}`, data),
};