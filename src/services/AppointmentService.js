// src/services/AppointmentService.js
import HttpClient from './HttpClient';
import { APPOINTMENT_ENDPOINTS, API_BASE_URL } from '../config/apiConfig';

class AppointmentService {
  // Create a new appointment
  async createAppointment(appointmentData) {
    try {
      console.log('Creating appointment with data:', appointmentData);
      const response = await HttpClient.post(APPOINTMENT_ENDPOINTS.CREATE, appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create appointment.' 
      };
    }
  }

  // Get appointment details by ID
  async getAppointmentById(id) {
    try {
      const response = await HttpClient.get(APPOINTMENT_ENDPOINTS.DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment details.' 
      };
    }
  }

  // Get appointments for current user (patient or doctor)
  async getUserAppointments() {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/appointments/user`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointments.' 
      };
    }
  }

  // Get appointments by doctor ID
  async getDoctorAppointments(doctorId) {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/appointments/doctor/${doctorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch doctor appointments.' 
      };
    }
  }

  // Get appointments by patient ID
  async getPatientAppointments(patientId) {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/appointments/patient/${patientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch patient appointments.' 
      };
    }
  }

  // Cancel an appointment
  async cancelAppointment(id, reason) {
    try {
      const response = await HttpClient.post(APPOINTMENT_ENDPOINTS.CANCEL(id), { reason });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel appointment.' 
      };
    }
  }

  // Reschedule an appointment
  async rescheduleAppointment(id, newDateTime) {
    try {
      const response = await HttpClient.post(APPOINTMENT_ENDPOINTS.RESCHEDULE(id), { 
        appointmentDateTime: newDateTime 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reschedule appointment.' 
      };
    }
  }

  // Get doctor availability for a specific date and type
  async getDoctorAvailability(doctorId, date, type = 'video') {
    try {
      // Format date for API request (YYYY-MM-DD)
      const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      
      const response = await HttpClient.get(
        `${API_BASE_URL}/api/doctors/${doctorId}/availability?date=${formattedDate}&type=${type}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch doctor availability.' 
      };
    }
  }

  // Complete an appointment (mark as completed)
  async completeAppointment(id, notes) {
    try {
      const response = await HttpClient.post(`${API_BASE_URL}/api/appointments/${id}/complete`, { 
        notes 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error completing appointment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to complete appointment.' 
      };
    }
  }

  // Start a video appointment
  async startVideoAppointment(appointmentId) {
    try {
      const response = await HttpClient.post(`${API_BASE_URL}/api/video/create-session`, { 
        appointmentId 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error starting video appointment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to start video appointment.' 
      };
    }
  }

  // Join a video appointment
  async joinVideoAppointment(sessionId) {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/video/join/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error joining video appointment:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to join video appointment.' 
      };
    }
  }
}


export default new AppointmentService();