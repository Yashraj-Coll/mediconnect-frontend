// src/services/PrescriptionService.js
import HttpClient from './HttpClient';

const API_BASE = '/api/prescriptions';

class PrescriptionService {
  /**
   * Get all prescriptions
   */
  async getAllPrescriptions() {
    try {
      const response = await HttpClient.get(API_BASE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch prescriptions.'
      };
    }
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(id) {
    try {
      const response = await HttpClient.get(`${API_BASE}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching prescription:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch prescription.'
      };
    }
  }

  /**
   * Get prescriptions by patient ID
   */
  async getPrescriptionsByPatientId(patientId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/patient/${patientId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching patient prescriptions:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch patient prescriptions.'
      };
    }
  }

  /**
   * Get active prescriptions for a patient
   */
  async getActivePrescriptionsForPatient(patientId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/patient/${patientId}/active`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching active prescriptions:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch active prescriptions.'
      };
    }
  }

  /**
   * Get prescription items for a prescription
   */
  async getPrescriptionItems(prescriptionId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/${prescriptionId}/items`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching prescription items:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch prescription items.'
      };
    }
  }

  /**
   * Get prescription remaining days
   */
  async getPrescriptionRemainingDays(prescriptionId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/${prescriptionId}/remaining-days`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching prescription remaining days:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch prescription remaining days.'
      };
    }
  }

  /**
   * Create a new prescription
   */
  async createPrescription(prescriptionData) {
    try {
      const response = await HttpClient.post(API_BASE, prescriptionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error creating prescription:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create prescription.'
      };
    }
  }

  /**
   * Update an existing prescription
   */
  async updatePrescription(id, prescriptionData) {
    try {
      const response = await HttpClient.put(`${API_BASE}/${id}`, prescriptionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error updating prescription:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update prescription.'
      };
    }
  }

  /**
   * Process prescription refill
   */
  async processPrescriptionRefill(prescriptionId) {
    try {
      const response = await HttpClient.post(`${API_BASE}/${prescriptionId}/refill`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error processing prescription refill:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to process refill.'
      };
    }
  }

  /**
   * Set prescription reminder
   */
  async setPrescriptionReminder(prescriptionId) {
    try {
      const response = await HttpClient.post(`${API_BASE}/${prescriptionId}/reminder`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error setting prescription reminder:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to set reminder.'
      };
    }
  }

  /**
   * Cancel prescription reminder
   */
  async cancelPrescriptionReminder(prescriptionId) {
    try {
      const response = await HttpClient.delete(`${API_BASE}/${prescriptionId}/reminder`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error canceling prescription reminder:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel reminder.'
      };
    }
  }

  /**
   * Delete a prescription (Admin only)
   */
  async deletePrescription(id) {
    try {
      await HttpClient.delete(`${API_BASE}/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting prescription:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete prescription.'
      };
    }
  }

  /**
   * Format medication frequency for display
   */
  formatFrequency(frequency) {
    if (!frequency) return '';
    
    // Format frequencies for better display
    const normalized = frequency.toLowerCase();
    
    if (normalized.includes('once daily')) {
      if (normalized.includes('morning')) {
        return 'Once daily (morning)';
      } else if (normalized.includes('night') || normalized.includes('evening')) {
        return 'Once daily (night)';
      } else {
        return 'Once daily';
      }
    } else if (normalized.includes('twice daily')) {
      return 'Twice daily';
    } else if (normalized.includes('three') && normalized.includes('day')) {
      return 'Three times daily';
    } else if (normalized.includes('four') && normalized.includes('day')) {
      return 'Four times daily';
    } else if (normalized.includes('week')) {
      return 'Weekly';
    } else if (normalized.includes('month')) {
      return 'Monthly';
    } else if (normalized.includes('as needed') || normalized.includes('prn')) {
      return 'As needed (PRN)';
    }
    
    return frequency;
  }

  /**
   * Parse duration to display format
   */
  parseDuration(duration) {
    if (!duration) return '';
    
    const normalized = duration.toLowerCase().trim();
    
    // Extract number and unit
    const parts = normalized.split(/\s+/);
    if (parts.length < 2) {
      return duration;
    }
    
    const value = parts[0];
    const unit = parts[1];
    
    // Format nicely
    if (unit.startsWith('day')) {
      return `${value} day${value === '1' ? '' : 's'}`;
    } else if (unit.startsWith('week')) {
      return `${value} week${value === '1' ? '' : 's'}`;
    } else if (unit.startsWith('month')) {
      return `${value} month${value === '1' ? '' : 's'}`;
    } else if (unit.startsWith('year')) {
      return `${value} year${value === '1' ? '' : 's'}`;
    }
    
    return duration;
  }

  /**
   * Get medication by type
   */
  getMedicationsByType(prescriptions) {
    // Fix: Make sure prescriptions is always treated as an array
    const prescriptionArray = Array.isArray(prescriptions) ? prescriptions : (prescriptions ? [prescriptions] : []);
    
    if (prescriptionArray.length === 0) {
      return [];
    }
    
    const medications = [];
    
    prescriptionArray.forEach(prescription => {
      if (prescription && prescription.prescriptionItems && prescription.prescriptionItems.length > 0) {
        prescription.prescriptionItems.forEach(item => {
          medications.push({
            id: item.id,
            name: item.medicationName,
            dosage: item.dosage,
            frequency: this.formatFrequency(item.frequency),
            instructions: item.instructions,
            prescriptionId: prescription.id,
            validUntil: prescription.validUntil,
            isActive: prescription.validUntil ? new Date(prescription.validUntil) > new Date() : true
          });
        });
      }
    });
    
    return medications;
  }
}

export default new PrescriptionService();