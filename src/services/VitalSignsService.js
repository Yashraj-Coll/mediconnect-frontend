// src/services/VitalSignsService.js
import HttpClient from './HttpClient';

const API_BASE = '/api/vital-signs';

class VitalSignsService {
  /**
   * Get all vital signs for a patient
   */
  async getVitalSignsByPatientId(patientId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/patient/${patientId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching vital signs:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch vital signs.'
      };
    }
  }

  /**
   * Get vital signs by type for a patient
   */
  async getVitalSignsByType(patientId, readingType) {
    try {
      const response = await HttpClient.get(`${API_BASE}/patient/${patientId}/type/${readingType}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching ${readingType} readings:`, error);
      return {
        success: false,
        error: error.response?.data?.message || `Failed to fetch ${readingType} readings.`
      };
    }
  }

  /**
   * Get latest vital signs for a patient
   */
  async getLatestVitalSigns(patientId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/patient/${patientId}/latest`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching latest vital signs:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch latest vital signs.'
      };
    }
  }

  /**
   * Get vital signs history for analytics
   */
  async getVitalSignsHistory(patientId, readingType, timeFrame = 'month') {
    try {
      const response = await HttpClient.get(
        `${API_BASE}/patient/${patientId}/analytics/${readingType}?timeFrame=${timeFrame}`
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching ${readingType} history:`, error);
      return {
        success: false,
        error: error.response?.data?.message || `Failed to fetch ${readingType} history.`
      };
    }
  }

  /**
   * Add a new vital sign reading
   */
  async addVitalSign(vitalSignData) {
    try {
      const response = await HttpClient.post(API_BASE, vitalSignData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error adding vital sign:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add vital sign.'
      };
    }
  }

  /**
   * Update a vital sign reading
   */
  async updateVitalSign(id, vitalSignData) {
    try {
      const response = await HttpClient.put(`${API_BASE}/${id}`, vitalSignData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error updating vital sign:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update vital sign.'
      };
    }
  }

  /**
   * Delete a vital sign reading
   */
  async deleteVitalSign(id) {
    try {
      await HttpClient.delete(`${API_BASE}/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error("Error deleting vital sign:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete vital sign.'
      };
    }
  }

  /**
   * Get out-of-range vital signs for a patient
   */
  async getOutOfRangeVitalSigns(patientId) {
    try {
      const response = await HttpClient.get(`${API_BASE}/patient/${patientId}/out-of-range`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching out-of-range vital signs:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch out-of-range vital signs.'
      };
    }
  }

  /**
   * Format vital sign value with unit for display
   */
  formatVitalSignWithUnit(vitalSign) {
    if (!vitalSign) return '';
    return `${vitalSign.readingValue} ${vitalSign.readingUnit}`;
  }

  /**
   * Get appropriate status class for vital sign status
   */
  getStatusClass(status) {
    switch (status) {
      case 'NORMAL':
        return 'text-green-500';
      case 'ELEVATED':
        return 'text-orange-500';
      case 'LOW':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Parse vital sign data for chart display
   */
  parseChartData(vitalSignsData, readingType) {
    // Return empty array if no data
    if (!vitalSignsData || vitalSignsData.length === 0) {
      return [];
    }

    // Sort by date (oldest first for charts)
    const sortedData = [...vitalSignsData].sort((a, b) => 
      new Date(a.readingDate) - new Date(b.readingDate)
    );

    // Parse based on reading type
    switch (readingType) {
      case 'BLOOD_PRESSURE':
        return sortedData.map(item => {
          const [systolic, diastolic] = item.readingValue.split('/').map(v => parseInt(v.trim(), 10));
          return {
            date: new Date(item.readingDate).toLocaleDateString(),
            systolic,
            diastolic,
            status: item.readingStatus
          };
        });
      
      default:
        // For others like heart rate, weight, etc.
        return sortedData.map(item => {
          return {
            date: new Date(item.readingDate).toLocaleDateString(),
            value: parseFloat(item.readingValue),
            status: item.readingStatus
          };
        });
    }
  }
}

export default new VitalSignsService();