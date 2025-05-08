// src/services/UserService.js
import HttpClient from './HttpClient';
import { USER_ENDPOINTS } from '../config/apiConfig';

class UserService {
  // Get current user profile
  async getProfile() {
    try {
      const response = await HttpClient.get(USER_ENDPOINTS.PROFILE);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user profile.'
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await HttpClient.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user profile.'
      };
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await HttpClient.post(USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change password.'
      };
    }
  }
}

export default new UserService();