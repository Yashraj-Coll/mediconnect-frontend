// src/services/MedicalRecordService.js
import HttpClient from './HttpClient';

const API_BASE = '/api/medical-records';

class MedicalRecordService {
  /**
   * Get all medical records for a patient
   */
  async getPatientMedicalRecords(patientId) {
    try {
      const response = await HttpClient.get(`/api/medical-documents/patient/${patientId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching patient medical records:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch medical records.'
      };
    }
  }

  /**
   * Get medical record by ID
   */
  async getMedicalRecordById(id) {
    try {
      const response = await HttpClient.get(`${API_BASE}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching medical record:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch medical record.'
      };
    }
  }

  /**
   * Get medical record by appointment ID
   */
  async getMedicalRecordByAppointmentId(appointmentId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/appointment/${appointmentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching medical record for appointment:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch medical record for appointment.'
      };
    }
  }

  /**
   * Download a medical record document
   */
  async downloadMedicalRecord(recordId) {
    try {
      const response = await HttpClient.get(`/api/medical-documents/${recordId}/download`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: this.getFilenameFromResponse(response)
      };
    } catch (error) {
      console.error("Error downloading medical record:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to download medical record.'
      };
    }
  }

  /**
   * Upload a medical record
   */
  async uploadMedicalRecord(patientId, formData) {
    try {
      const response = await HttpClient.post(`/api/medical-documents/patient/${patientId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error uploading medical record:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload medical record.'
      };
    }
  }

  /**
   * Get records by type
   */
  async getRecordsByType(patientId, recordType) {
    try {
      const records = await this.getPatientMedicalRecords(patientId);
      
      if (!records.success) {
        return records; // Return the error response
      }
      
      const filteredRecords = records.data.filter(record => {
        return record.documentType === recordType || 
               (record.title && record.title.includes(recordType));
      });
      
      return {
        success: true,
        data: filteredRecords
      };
    } catch (error) {
      console.error(`Error fetching ${recordType} records:`, error);
      return {
        success: false,
        error: `Failed to fetch ${recordType} records.`
      };
    }
  }
  
  /**
   * Delete a medical record
   */
  async deleteMedicalRecord(recordId) {
    try {
      await HttpClient.delete(`/api/medical-documents/${recordId}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting medical record:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete medical record.'
      };
    }
  }

  /**
   * Share a medical record
   */
  async shareMedicalRecord(recordId, recipientEmail, expiryDays = 7) {
    try {
      const response = await HttpClient.post(`/api/medical-documents/${recordId}/share`, {
        recipientEmail,
        expiryDays
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error sharing medical record:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to share medical record.'
      };
    }
  }

  /**
   * Helper function to extract filename from response headers
   */
  getFilenameFromResponse(response) {
    const contentDisposition = response.headers['content-disposition'];
    if (!contentDisposition) return 'medical_record.pdf';
    
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    return filenameMatch ? filenameMatch[1] : 'medical_record.pdf';
  }

  /**
   * Format record type for display
   */
  formatRecordType(type) {
    if (!type) return 'Other';
    
    // Clean up type string
    type = type.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    return type
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

export default new MedicalRecordService();