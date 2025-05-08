// src/config/apiConfig.js
import env from './env';

// Base URL for API requests
export const API_BASE_URL = env.API_BASE_URL;

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/signup`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`
};

// Doctor endpoints
export const DOCTOR_ENDPOINTS = {
  ALL: `${API_BASE_URL}/doctors`,
  DETAIL: (id) => `${API_BASE_URL}/doctors/${id}`,
  PUBLIC_ALL: `${API_BASE_URL}/doctors/public/all`,
  PUBLIC_SPECIALIZATION: (specialization) => `${API_BASE_URL}/doctors/public/specialization/${specialization}`
};

// Patient endpoints
export const PATIENT_ENDPOINTS = {
  ALL: `${API_BASE_URL}/patients`,
  DETAIL: (id) => `${API_BASE_URL}/patients/${id}`,
  APPOINTMENTS: `${API_BASE_URL}/patients/appointments`,
  MEDICAL_RECORDS: `${API_BASE_URL}/patients/medical-records`,
  PRESCRIPTIONS: `${API_BASE_URL}/patients/prescriptions`
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`
};

// Appointment endpoints
export const APPOINTMENT_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/appointments`,
  DETAIL: (id) => `${API_BASE_URL}/appointments/${id}`,
  CANCEL: (id) => `${API_BASE_URL}/appointments/${id}/cancel`,
  RESCHEDULE: (id) => `${API_BASE_URL}/appointments/${id}/reschedule`
};

// AI endpoints
export const AI_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/ai/chat`,
  ANALYZE: `${API_BASE_URL}/ai/analyze`
};

// Video consultation endpoints
export const VIDEO_ENDPOINTS = {
  CREATE_SESSION: `${API_BASE_URL}/video/create-session`,
  JOIN_SESSION: (sessionId) => `${API_BASE_URL}/video/join/${sessionId}`
};

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = env.REQUEST_TIMEOUT;

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'mediconnect_user',
  TOKEN: 'mediconnect_token',
  REFRESH_TOKEN: 'mediconnect_refresh_token'
};