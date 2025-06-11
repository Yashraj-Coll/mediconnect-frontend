// src/services/PatientService.js
import HttpClient from './HttpClient';
import { PATIENT_ENDPOINTS } from '../config/apiConfig';

class PatientService {
  // Get all patients
  async getAllPatients() {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.ALL);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patients.' };
    }
  }

  // Get patient by ID
  async getPatientById(id) {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient details.' };
    }
  }

  // Get patient by user ID
  async getPatientByUserId(userId) {
    if (!userId) {
      console.error('User ID is required to fetch patient details');
      return { success: false, error: 'User ID is required to fetch patient details' };
    }

    try {
      console.log('Requesting patient data for user ID:', userId);
       console.log('🔗 Full URL being requested:', PATIENT_ENDPOINTS.BY_USER_ID(userId));
      const response = await HttpClient.get(PATIENT_ENDPOINTS.BY_USER_ID(userId));
      console.log('Patient data response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching patient by user ID:', error);
      if (error.response?.status === 404) {
        return { success: false, error: 'Patient profile not found. Please create a profile.', notFound: true };
      }
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient details by user ID.' };
    }
  }

  // Get patient appointments
  async getPatientAppointments(patientId) {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.APPOINTMENTS(patientId));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient appointments.' };
    }
  }

  // Get patient medical records
  async getPatientMedicalRecords(patientId) {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.MEDICAL_RECORDS(patientId));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching medical records:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient medical records.' };
    }
  }

  // Get patient prescriptions
  async getPatientPrescriptions(patientId) {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.PRESCRIPTIONS(patientId));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch patient prescriptions.' };
    }
  }

  // Create patient profile
  async createPatient(patientData) {
    try {
      const response = await HttpClient.post(PATIENT_ENDPOINTS.ALL, patientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating patient profile:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create patient profile.' };
    }
  }

  // Update patient profile
  async updatePatient(id, patientData) {
    try {
      const response = await HttpClient.put(PATIENT_ENDPOINTS.DETAIL(id), patientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating patient profile:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update patient profile.' };
    }
  }

  // Emergency contacts
  async getPatientEmergencyContacts(patientId) {
    try {
      const response = await HttpClient.get(PATIENT_ENDPOINTS.EMERGENCY_CONTACTS(patientId));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch emergency contacts.' };
    }
  }

  async addEmergencyContact(patientId, contactData) {
    try {
      const response = await HttpClient.post(PATIENT_ENDPOINTS.EMERGENCY_CONTACTS(patientId), contactData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add emergency contact.' };
    }
  }

  async updateEmergencyContact(patientId, contactId, contactData) {
    try {
      const response = await HttpClient.put(PATIENT_ENDPOINTS.EMERGENCY_CONTACT_DETAIL(patientId, contactId), contactData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update emergency contact.' };
    }
  }

  async deleteEmergencyContact(patientId, contactId) {
    try {
      await HttpClient.delete(PATIENT_ENDPOINTS.EMERGENCY_CONTACT_DETAIL(patientId, contactId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete emergency contact.' };
    }
  }
}

export default new PatientService();
