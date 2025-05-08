import axios from 'axios';

// Base API URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/mediconnect/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and we haven't tried to retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you could implement token refresh logic
      // For now, log the user out
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common API calls
const httpClient = {
  // Basic CRUD operations
  get: (endpoint, params = {}) => api.get(endpoint, { params }),
  post: (endpoint, data = {}) => api.post(endpoint, data),
  put: (endpoint, data = {}) => api.put(endpoint, data),
  patch: (endpoint, data = {}) => api.patch(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
  
  // Auth endpoints
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/signup', userData),
  
  // Get base URL (useful for building complete URLs)
  getBaseUrl: () => API_BASE_URL
};

export default httpClient;