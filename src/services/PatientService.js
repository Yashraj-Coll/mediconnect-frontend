// src/services/PatientService.js
import HttpClient from './HttpClient';
import { PATIENT_ENDPOINTS } from '../config/apiConfig';

class PatientService {
  // Get all patients (admin/doctor only)
  async getAllPatients() {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.ALL);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patients.'
      };
    }
  }

  // Get patient by ID
  async getPatientById(id) {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.DETAIL(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patient details.'
      };
    }
  }

  // Get patient by user ID
  async getPatientByUserId(userId) {
    try {
      const response = await HttpClient.get(`${PATIENT_ENDPOINTS.ALL}/by-user/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patient details by user ID.'
      };
    }
  }

  // Create patient profile
  async createPatient(patientData) {
    try {
      const response = await HttpClient.post(PATIENT_ENDPOINTS.ALL, patientData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create patient profile.'
      };
    }
  }

  // Update patient profile
  async updatePatient(id, patientData) {
    try {
      const response = await HttpClient.put(PATIENT_ENDPOINTS.DETAIL(id), patientData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update patient profile.'
      };
    }
  }

  // Search patients (admin/doctor only)
  async searchPatients(keyword) {
    try {
      const response = await HttpClient.get(`${PATIENT_ENDPOINTS.ALL}/search`, { keyword });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search patients.'
      };
    }
  }

  // Get patients by medical condition (admin/doctor only)
  async getPatientsByCondition(condition) {
    try {
      const response = await HttpClient.get(`${PATIENT_ENDPOINTS.ALL}/condition`, { condition });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patients by condition.'
      };
    }
  }

  // Get patients by doctor (admin/doctor only)
  async getPatientsByDoctor(doctorId) {
    try {
      const response = await HttpClient.get(`${PATIENT_ENDPOINTS.ALL}/by-doctor/${doctorId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patients by doctor.'
      };
    }
  }

  // Get patients by insurance provider (admin/doctor only)
  async getPatientsByInsurance(provider) {
    try {
      const response = await HttpClient.get(`${PATIENT_ENDPOINTS.ALL}/insurance/${provider}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patients by insurance.'
      };
    }
  }

  // Delete patient profile (admin only)
  async deletePatient(id) {
    try {
      await HttpClient.delete(PATIENT_ENDPOINTS.DETAIL(id));
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete patient profile.'
      };
    }
  }
}

export default new PatientService();