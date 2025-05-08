// src/services/DoctorService.js
import HttpClient from './HttpClient';
import { DOCTOR_ENDPOINTS } from '../config/apiConfig';

class DoctorService {
  // Get all doctors
  async getAllDoctors(params = {}) {
    try {
      const response = await HttpClient.get(DOCTOR_ENDPOINTS.ALL, params);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch doctors.'
      };
    }
  }

  // Get doctor by ID
  async getDoctorById(id) {
    try {
      const response = await HttpClient.get(DOCTOR_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch doctor details.'
      };
    }
  }

  // Search doctors by keyword
  async searchDoctors(keyword) {
    try {
      const response = await HttpClient.get(`${DOCTOR_ENDPOINTS.ALL}/search`, { keyword });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search doctors.'
      };
    }
  }

  // Get doctors by specialization
  async getDoctorsBySpecialization(specialization) {
    try {
      const response = await HttpClient.get(`${DOCTOR_ENDPOINTS.ALL}/specialization/${specialization}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch doctors by specialization.'
      };
    }
  }

  // Get doctors by max consultation fee
  async getDoctorsByMaxFee(maxFee) {
    try {
      const response = await HttpClient.get(`${DOCTOR_ENDPOINTS.ALL}/fee`, { maxFee });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch doctors by fee.'
      };
    }
  }

  // Get top rated doctors
  async getTopRatedDoctors() {
    try {
      const response = await HttpClient.get(`${DOCTOR_ENDPOINTS.ALL}/top-rated`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch top rated doctors.'
      };
    }
  }

  // Get doctors available for emergency
  async getEmergencyDoctors() {
    try {
      const response = await HttpClient.get(`${DOCTOR_ENDPOINTS.ALL}/emergency`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch emergency doctors.'
      };
    }
  }

  // Create doctor profile (admin only)
  async createDoctor(doctorData) {
    try {
      const response = await HttpClient.post(DOCTOR_ENDPOINTS.ALL, doctorData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create doctor profile.'
      };
    }
  }

  // Update doctor profile
  async updateDoctor(id, doctorData) {
    try {
      const response = await HttpClient.put(DOCTOR_ENDPOINTS.DETAIL(id), doctorData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update doctor profile.'
      };
    }
  }

  // Delete doctor profile (admin only)
  async deleteDoctor(id) {
    try {
      await HttpClient.delete(DOCTOR_ENDPOINTS.DETAIL(id));
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete doctor profile.'
      };
    }
  }
}

export default new DoctorService();