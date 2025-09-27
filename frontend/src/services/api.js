import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// Project API
export const projectAPI = {
  getProjects: (params = {}) => api.get('/projects', { params }),
  getProject: (projectId) => api.get(`/projects/${projectId}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (projectId, projectData) => api.put(`/projects/${projectId}`, projectData),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
  addProcess: (projectId, processData) => api.post(`/projects/${projectId}/processes`, processData),
  updateProcess: (projectId, processId, processData) => api.put(`/projects/${projectId}/processes/${processId}`, processData),
  deleteProcess: (projectId, processId) => api.delete(`/projects/${projectId}/processes/${processId}`),
};

// Analysis API
export const analysisAPI = {
  runAnalysis: (projectId) => api.post(`/analysis/${projectId}/run`),
  getResults: (projectId) => api.get(`/analysis/${projectId}/results`),
  getCircularity: (projectId) => api.get(`/analysis/${projectId}/circularity`),
  compareProjects: (projectIds) => api.post('/analysis/compare', { projectIds }),
};

// Reports API
export const reportsAPI = {
  generateReport: (projectId, options = {}) => api.post(`/reports/${projectId}/generate`, options),
  getReports: (projectId) => api.get(`/reports/${projectId}`),
  downloadReport: (projectId, reportId) => api.get(`/reports/${projectId}/download/${reportId}`),
  exportProject: (projectId, format = 'json') => api.get(`/reports/${projectId}/export?format=${format}`),
};

export default api;

