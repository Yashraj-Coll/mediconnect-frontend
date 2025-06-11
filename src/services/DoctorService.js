// src/services/DoctorService.js - EMERGENCY FIX
import HttpClient from './HttpClient';
import { DOCTOR_ENDPOINTS, API_BASE_URL } from '../config/apiConfig';

class DoctorService {
  // Enhanced token getter with session token support
  getAuthHeaders() {
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('accessToken');
    
    const sessionToken = localStorage.getItem('session_token') ||
                        localStorage.getItem('sessionToken');
    
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (sessionToken) {
      headers['X-Session-Id'] = sessionToken;
    }
    
    return headers;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('accessToken');
    return !!token;
  }

  // Get all doctors - improved with better error handling
  async getAllDoctors(params = {}) {
    try {
      console.log("🏥 Fetching all doctors from:", DOCTOR_ENDPOINTS?.PUBLIC_ALL || "/api/doctors/public/all");
      const endpoint = DOCTOR_ENDPOINTS?.PUBLIC_ALL || "/api/doctors/public/all";
      const response = await HttpClient.get(endpoint, params);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch doctors.'
      };
    }
  }

  // Get doctor by ID - improved
  async getDoctorById(id) {
    try {
      const endpoint = DOCTOR_ENDPOINTS?.PUBLIC_DETAIL ? 
                     DOCTOR_ENDPOINTS.PUBLIC_DETAIL(id) : 
                     `/api/doctors/public/${id}`;
                     
      console.log("🔍 Fetching doctor details from:", endpoint);
      const response = await HttpClient.get(endpoint);
      
      // Log the languages received from the API for debugging
      if (response.data && response.data.languages) {
        console.log("🗣️ Doctor languages received:", response.data.languages);
      } else {
        console.log("⚠️ No languages found in doctor data");
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Error fetching doctor details:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch doctor details.'
      };
    }
  }

  // EMERGENCY FIX: Use HttpClient instead of direct fetch
  async createDoctor(doctorData) {
    try {
      console.log('🚀 DoctorService: Creating doctor via HttpClient');
      
      if (!this.isAuthenticated()) {
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          requiresAuth: true
        };
      }

      // Use HttpClient which properly handles tokens and session IDs
      const response = await HttpClient.post('/api/doctors', doctorData);
      
      console.log('✅ Doctor created successfully:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error creating doctor:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication expired. Please login again.',
          errorCode: 'AUTH_EXPIRED',
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create doctor.'
      };
    }
  }

  // EMERGENCY FIX: Use HttpClient instead of direct fetch for update
  async updateDoctor(id, doctorData) {
    try {
      console.log('🔄 DoctorService: Updating doctor ID via HttpClient:', id);
      
      if (!this.isAuthenticated()) {
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          requiresAuth: true
        };
      }

      // Use HttpClient which properly handles tokens and session IDs
      const response = await HttpClient.put(`/api/doctors/${id}`, doctorData);
      
      console.log('✅ Doctor updated successfully:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error updating doctor:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication expired. Please login again.',
          errorCode: 'AUTH_EXPIRED',
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update doctor.'
      };
    }
  }

  // EMERGENCY FIX: Use HttpClient for delete
  async deleteDoctor(id) {
    try {
      console.log('🗑️ DoctorService: Deleting doctor ID via HttpClient:', id);
      
      if (!this.isAuthenticated()) {
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          requiresAuth: true
        };
      }
      
      const response = await HttpClient.delete(`/api/doctors/${id}`);
      
      console.log('✅ Doctor deleted successfully:', response.data);
      return { 
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error deleting doctor:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication expired. Please login again.',
          errorCode: 'AUTH_EXPIRED',
          requiresAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete doctor.'
      };
    }
  }

  // Search doctors by keyword
  async searchDoctors(keyword) {
    try {
      console.log("🔍 Searching doctors with keyword:", keyword);
      const endpoint = `${DOCTOR_ENDPOINTS?.ALL || '/api/doctors'}/search`;
      const response = await HttpClient.get(endpoint, { keyword });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Error searching doctors:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to search doctors.'
      };
    }
  }

  // Get doctors by specialization
  async getDoctorsBySpecialization(specialization) {
    try {
      console.log("🏥 Fetching doctors by specialization:", specialization);
      const endpoint = DOCTOR_ENDPOINTS?.PUBLIC_SPECIALIZATION ? 
                      DOCTOR_ENDPOINTS.PUBLIC_SPECIALIZATION(specialization) :
                      `/api/doctors/specialization/${specialization}`;
                      
      const response = await HttpClient.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Error fetching doctors by specialization:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch doctors by specialization.'
      };
    }
  }

  // Get doctors by max consultation fee
  async getDoctorsByMaxFee(maxFee) {
    try {
      const endpoint = `${DOCTOR_ENDPOINTS?.ALL || '/api/doctors'}/fee`;
      const response = await HttpClient.get(endpoint, { maxFee });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch doctors by fee.'
      };
    }
  }

  // Get top rated doctors
  async getTopRatedDoctors() {
    try {
      const endpoint = `${DOCTOR_ENDPOINTS?.ALL || '/api/doctors'}/top-rated`;
      const response = await HttpClient.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch top rated doctors.'
      };
    }
  }

  // Get doctors available for emergency
  async getEmergencyDoctors() {
    try {
      const endpoint = `${DOCTOR_ENDPOINTS?.ALL || '/api/doctors'}/emergency`;
      const response = await HttpClient.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch emergency doctors.'
      };
    }
  }

  // Upload profile image for a doctor
  async uploadProfileImage(id, file, onUploadProgress) {
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      const endpoint = DOCTOR_ENDPOINTS?.UPLOAD_PROFILE_IMAGE ? 
                      DOCTOR_ENDPOINTS.UPLOAD_PROFILE_IMAGE(id) : 
                      `/api/doctors/${id}/upload-profile`;
      
      const response = await HttpClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onUploadProgress
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("❌ Error uploading profile image:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to upload profile image.'
      };
    }
  }

  // Helper method to validate doctor data
  validateDoctorData(doctorData) {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'specialization', 
      'licenseNumber', 'education', 'yearsOfExperience', 'consultationFee'
    ];
    
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!doctorData[field] || doctorData[field].toString().trim() === '') {
        errors[field] = `${field} is required`;
      }
    });
    
    // Email validation
    if (doctorData.email && !/\S+@\S+\.\S+/.test(doctorData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Number validations
    if (doctorData.yearsOfExperience && (isNaN(doctorData.yearsOfExperience) || doctorData.yearsOfExperience < 0)) {
      errors.yearsOfExperience = 'Years of experience must be a positive number';
    }
    
    if (doctorData.consultationFee && (isNaN(doctorData.consultationFee) || doctorData.consultationFee < 0)) {
      errors.consultationFee = 'Consultation fee must be a positive number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Helper method to format doctor data for display
  formatDoctorForDisplay(doctor) {
    return {
      ...doctor,
      fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      experienceText: `${doctor.yearsOfExperience} years experience`,
      feeText: `₹${doctor.consultationFee}`,
      profileImageUrl: doctor.profileImage ? 
        `${API_BASE_URL}/uploads/${doctor.profileImage}` : 
        (doctor.gender === 'FEMALE' ? '/images/Female Doctor.jpg' : '/images/Male Doctor.jpg')
    };
  }
}

export default new DoctorService();