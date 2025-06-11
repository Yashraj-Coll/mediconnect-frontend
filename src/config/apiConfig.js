// src/config/apiConfig.js
import env from './env';

// Backend base URL
const BACKEND_URL = 'http://localhost:8080';

// API base URL for all endpoints
export const API_BASE_URL = `${BACKEND_URL}/mediconnect`;

// Auth endpoints - UPDATED
export const AUTH_ENDPOINTS = {
  LOGIN:         '/api/auth/login',
  REGISTER:      '/api/auth/signup',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  CURRENT_USER:  '/api/auth/current-user',  // ADD this endpoint
  LOGOUT:        '/api/auth/logout',
};

// Doctor endpoints
export const DOCTOR_ENDPOINTS = {
  ALL:                    '/api/doctors',
  DETAIL:     id       => `/api/doctors/${id}`,
  PUBLIC_ALL:            '/api/doctors/public/all',
  PUBLIC_DETAIL: id      => `/api/doctors/public/${id}`,
  PUBLIC_SPECIALIZATION: spec => `/api/doctors/public/specialization/${spec}`,
};

// Patient endpoints
export const PATIENT_ENDPOINTS = {
  ALL:                 '/api/patients',
  DETAIL:     id      => `/api/patients/${id}`,
  BY_USER_ID: uid     => `/api/patients/by-user/${uid}`,
  APPOINTMENTS: pid   => `/api/appointments/patient/${pid}`,
  MEDICAL_RECORDS: pid => `/api/medical-records/patient/${pid}`,
  PRESCRIPTIONS:      pid => `/api/prescriptions/patient/${pid}`,
};

// User endpoints - UPDATED
export const USER_ENDPOINTS = {
  PROFILE:         '/api/users/profile',          // Now includes role
  UPDATE_PROFILE:  '/api/users/profile',
  CHANGE_PASSWORD: '/api/users/change-password',
  ROLE:       id => `/api/users/${id}/role`,      // ADD this endpoint
  ROLES:      id => `/api/users/${id}/roles`,     // ADD this endpoint
};

// Appointment endpoints
export const APPOINTMENT_ENDPOINTS = {
  CREATE:    '/api/appointments',
  DETAIL:    id => `/api/appointments/${id}`,
  CANCEL:    id => `/api/appointments/${id}/cancel`,
  RESCHEDULE:id => `/api/appointments/${id}/reschedule`,
};

// AI endpoints
export const AI_ENDPOINTS = {
  CHAT:    '/api/ai/chat',
  ANALYZE: '/api/ai/analyze',
};

// Video consultation endpoints
export const VIDEO_ENDPOINTS = {
  CREATE_SESSION: '/api/video/create-session',
  JOIN_SESSION:   id => `/api/video/join/${id}`,
};

// Add these new endpoints in apiConfig.js
export const ADMIN_ENDPOINTS = {
  USERS:     '/api/admin/users',
  PATIENTS:  '/api/admin/patients', 
  ADMINS:    '/api/admin/admins',
  STATS:     '/api/admin/stats',
  USERS_BY_ROLE: (role) => `/api/admin/users/role/${role}`
};

// Request timeout
export const REQUEST_TIMEOUT = env.REQUEST_TIMEOUT || 10000;

// Local storage keys
export const STORAGE_KEYS = {
  USER:          'user',
  TOKEN:         'token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_TOKEN: 'session_token',
};