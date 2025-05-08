import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle token expiry - redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service class
const ApiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/api/auth/signin', credentials),
    register: (userData) => apiClient.post('/api/auth/signup', userData),
    getUser: () => apiClient.get('/api/auth/user'),
    refreshToken: () => apiClient.post('/api/auth/refresh-token')
  },
  
  // User endpoints
  users: {
    getProfile: (userId) => apiClient.get(`/api/users/${userId}/profile`),
    updateProfile: (userId, profileData) => apiClient.put(`/api/users/${userId}/profile`, profileData),
    uploadProfileImage: (userId, formData) => apiClient.post(`/api/users/${userId}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Patient endpoints
  patients: {
    getByUserId: (userId) => apiClient.get(`/api/patients/by-user/${userId}`),
    getById: (patientId) => apiClient.get(`/api/patients/${patientId}`),
    create: (patientData) => apiClient.post('/api/patients', patientData),
    update: (patientId, patientData) => apiClient.put(`/api/patients/${patientId}`, patientData),
    search: (keyword) => apiClient.get(`/api/patients/search?keyword=${keyword}`),
    getByCondition: (condition) => apiClient.get(`/api/patients/condition?condition=${condition}`)
  },
  
  // Doctor endpoints
  doctors: {
    getAll: () => apiClient.get('/api/doctors/public/all'),
    getById: (doctorId) => apiClient.get(`/api/doctors/public/${doctorId}`),
    getBySpecialization: (specialization) => apiClient.get(`/api/doctors/public/specialization/${specialization}`),
    getTopRated: () => apiClient.get('/api/doctors/public/top-rated'),
    search: (keyword) => apiClient.get(`/api/doctors/public/search?keyword=${keyword}`),
    getEmergencyDoctors: () => apiClient.get('/api/doctors/emergency'),
    getLanguages: (doctorId) => apiClient.get(`/api/doctors/${doctorId}/languages`)
  },
  
  // Appointment endpoints
  appointments: {
    getByPatient: (patientId) => apiClient.get(`/api/appointments/patient/${patientId}`),
    getByDoctor: (doctorId) => apiClient.get(`/api/appointments/doctor/${doctorId}`),
    getById: (appointmentId) => apiClient.get(`/api/appointments/${appointmentId}`),
    create: (appointmentData) => apiClient.post('/api/appointments', appointmentData),
    update: (appointmentId, appointmentData) => apiClient.put(`/api/appointments/${appointmentId}`, appointmentData),
    cancel: (appointmentId) => apiClient.put(`/api/appointments/${appointmentId}/status/CANCELLED`),
    complete: (appointmentId) => apiClient.put(`/api/appointments/${appointmentId}/status/COMPLETED`)
  },
  
  // Medical Records endpoints
  medicalRecords: {
    getByPatient: (patientId) => apiClient.get(`/api/medical-records/patient/${patientId}`),
    getByDoctor: (doctorId) => apiClient.get(`/api/medical-records/doctor/${doctorId}`),
    getById: (recordId) => apiClient.get(`/api/medical-records/${recordId}`),
    create: (recordData) => apiClient.post('/api/medical-records', recordData),
    update: (recordId, recordData) => apiClient.put(`/api/medical-records/${recordId}`, recordData),
    delete: (recordId) => apiClient.delete(`/api/medical-records/${recordId}`)
  },
  
  // Medical Documents endpoints
  medicalDocuments: {
    getByPatient: (patientId) => apiClient.get(`/api/medical-documents/patient/${patientId}`),
    getByRecord: (recordId) => apiClient.get(`/api/medical-documents/medical-record/${recordId}`),
    upload: (patientId, formData) => apiClient.post(`/api/medical-documents/patient/${patientId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (documentId) => apiClient.get(`/api/medical-documents/${documentId}/download`, {
      responseType: 'blob'
    }),
    delete: (documentId) => apiClient.delete(`/api/medical-documents/${documentId}`)
  },
  
  // Video Consultation endpoints
  videoConsultation: {
    getSessionDetails: (appointmentId) => apiClient.get(`/api/video-sessions/appointment/${appointmentId}`),
    joinSession: (sessionId) => apiClient.post(`/api/video-sessions/${sessionId}/join`),
    endSession: (sessionId) => apiClient.post(`/api/video-sessions/${sessionId}/end`)
  },
  
  // Payment endpoints
  payments: {
    createPaymentIntent: (appointmentId) => apiClient.post(`/api/payments/create-intent/${appointmentId}`),
    confirmPayment: (appointmentId, paymentId) => apiClient.post(`/api/payments/confirm/${appointmentId}`, { paymentId }),
    getPaymentHistory: (patientId) => apiClient.get(`/api/payments/history/patient/${patientId}`)
  },
  
  // Utility function to handle file uploads
  uploadFile: (url, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  },
  
  // Handle API errors
  handleError: (error) => {
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 400 && data.message) {
        errorMessage = data.message;
      } else if (status === 401) {
        errorMessage = 'Please login to continue.';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from server. Please check your internet connection.';
    }
    
    console.error('API Error:', error);
    return errorMessage;
  }
};

export default ApiService;