import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

export const getDocuments = (params) => api.get('/documents', { params });
export const getDocument  = (id, language) => api.get(`/documents/${id}`, { params: { language } });
export const getCategories = (params) => api.get('/documents/categories', { params });
export const getStats      = (params) => api.get('/documents/stats', { params });
export const getTree       = (params) => api.get('/documents/tree', { params });
export const getLanguages  = () => api.get('/documents/languages');

export default api;
