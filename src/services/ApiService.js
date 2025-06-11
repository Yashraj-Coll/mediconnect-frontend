// src/config/apiConfig.js

// Base URL for API calls
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/mediconnect';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/signin',
  REGISTER: '/api/auth/signup',
  VERIFY_EMAIL: '/api/auth/verify-email',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  ME: '/api/auth/me'
};

// User endpoints
export const USER_ENDPOINTS = {
  ALL: '/api/users',
  DETAIL: (id) => `/api/users/${id}`,
  PROFILE: (id) => `/api/users/${id}/profile`,
  UPLOAD_PROFILE: (id) => `/api/users/${id}/upload-profile`
};

// Doctor endpoints
export const DOCTOR_ENDPOINTS = {
  ALL: '/api/doctors',
  PUBLIC_ALL: '/api/doctors/public/all',
  PUBLIC_DETAIL: (id) => `/api/doctors/public/${id}`,
  PUBLIC_SPECIALIZATION: (specialization) => `/api/doctors/public/specialization/${specialization}`,
  DETAIL: (id) => `/api/doctors/${id}`,
  BY_USER: (userId) => `/api/doctors/by-user/${userId}`,
  SPECIALIZATION: (specialization) => `/api/doctors/specialization/${specialization}`,
  EMERGENCY: '/api/doctors/emergency',
  TOP_RATED: '/api/doctors/top-rated',
  UPLOAD_PROFILE_IMAGE: (id) => `/api/doctors/${id}/upload-profile`
};

// Patient endpoints
export const PATIENT_ENDPOINTS = {
  ALL: '/api/patients',
  DETAIL: (id) => `/api/patients/${id}`,
  BY_USER: (userId) => `/api/patients/by-user/${userId}`,
  CONDITION: (condition) => `/api/patients/condition?condition=${condition}`
};

// Appointment endpoints
export const APPOINTMENT_ENDPOINTS = {
  ALL: '/api/appointments',
  DETAIL: (id) => `/api/appointments/${id}`,
  BY_PATIENT: (patientId) => `/api/appointments/patient/${patientId}`,
  BY_DOCTOR: (doctorId) => `/api/appointments/doctor/${doctorId}`,
  CANCEL: (id) => `/api/appointments/${id}/cancel`,
  COMPLETE: (id) => `/api/appointments/${id}/complete`
};

// Medical records endpoints
export const MEDICAL_RECORD_ENDPOINTS = {
  ALL: '/api/medical-records',
  DETAIL: (id) => `/api/medical-records/${id}`,
  BY_PATIENT: (patientId) => `/api/medical-records/patient/${patientId}`,
  BY_DOCTOR: (doctorId) => `/api/medical-records/doctor/${doctorId}`,
  BY_APPOINTMENT: (appointmentId) => `/api/medical-records/appointment/${appointmentId}`
};

// Medical documents endpoints
export const MEDICAL_DOCUMENT_ENDPOINTS = {
  ALL: '/api/medical-documents',
  DETAIL: (id) => `/api/medical-documents/${id}`,
  BY_RECORD: (recordId) => `/api/medical-documents/medical-record/${recordId}`,
  BY_PATIENT: (patientId) => `/api/medical-documents/patient/${patientId}`,
  DOWNLOAD: (id) => `/api/medical-documents/${id}/download`
};

// Reviews endpoints
export const REVIEW_ENDPOINTS = {
  ALL: '/api/reviews',
  DETAIL: (id) => `/api/reviews/${id}`,
  BY_DOCTOR: (doctorId) => `/api/reviews/doctor/${doctorId}`,
  BY_PATIENT: (patientId) => `/api/reviews/patient/${patientId}`
};

// Video session endpoints
export const VIDEO_SESSION_ENDPOINTS = {
  START: (appointmentId) => `/api/video-sessions/start/${appointmentId}`,
  JOIN: (sessionId) => `/api/video-sessions/join/${sessionId}`,
  END: (sessionId) => `/api/video-sessions/end/${sessionId}`,
  VALIDATE: (token) => `/api/video-sessions/validate?token=${token}`
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  ALL: '/api/notifications',
  UNREAD: '/api/notifications/unread',
  MARK_READ: (id) => `/api/notifications/${id}/read`,
  MARK_ALL_READ: '/api/notifications/mark-all-read'
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  CREATE_INTENT: (appointmentId) => `/api/payments/create-intent/${appointmentId}`,
  CONFIRM: (paymentIntentId) => `/api/payments/confirm/${paymentIntentId}`,
  HISTORY: (userId) => `/api/payments/history/${userId}`
};

// Specialization endpoints
export const SPECIALIZATION_ENDPOINTS = {
  ALL: '/api/specializations',
  POPULAR: '/api/specializations/popular'
};

// Symptom checker endpoints
export const SYMPTOM_CHECKER_ENDPOINTS = {
  CHECK: '/api/symptom-checker/check',
  SYMPTOMS: '/api/symptom-checker/symptoms',
  CONDITIONS: '/api/symptom-checker/conditions'
};