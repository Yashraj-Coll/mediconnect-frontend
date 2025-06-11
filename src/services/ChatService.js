// src/services/ChatService.js - CREATE THIS FILE

import HttpClient from './HttpClient';

export class ChatService {
  
  // Send chat message to AI
  static async sendMessage(message) {
    try {
      const response = await HttpClient.post('/api/ai/chat', {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }
  
  // Get user profile for AI context
  static async getProfile() {
    try {
      const response = await HttpClient.get('/api/ai/profile');
      return response.data;
    } catch (error) {
      console.error('Profile service error:', error);
      throw error;
    }
  }
  
  // Get medical context
  static async getMedicalContext() {
    try {
      const response = await HttpClient.get('/api/ai/medical-context');
      return response.data;
    } catch (error) {
      console.error('Medical context error:', error);
      throw error;
    }
  }
  
  // Get user type
  static async getUserType() {
    try {
      const response = await HttpClient.get('/api/ai/user-type');
      return response.data;
    } catch (error) {
      console.error('User type error:', error);
      throw error;
    }
  }
  
  // Translate text
  static async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      const response = await HttpClient.post('/api/ai/translate', {
        text,
        targetLanguage,
        sourceLanguage
      });
      return response.data;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }
  
  // Analyze medical image
  static async analyzeImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await HttpClient.post('/api/ai/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }
}

export default ChatService;