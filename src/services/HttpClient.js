// src/services/HttpClient.js
import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from '../config/apiConfig';

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add token to requests
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If the error status is 401 and we haven't already tried to refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { token } = response.data;
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          
          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh token is invalid, redirect to login
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

const HttpClient = {
  get: (url, params = {}) => instance.get(url, { params }),
  post: (url, data) => instance.post(url, data),
  put: (url, data) => instance.put(url, data),
  delete: (url, data) => instance.delete(url, { data })
};

export default HttpClient;