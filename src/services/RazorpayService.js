// src/services/RazorpayService.js

import HttpClient from './HttpClient';
import { API_BASE_URL } from '../config/apiConfig';

class RazorpayService {
  // Create a new payment order
  async createOrder(paymentData) {
    try {
      console.log('Creating Razorpay order with data:', paymentData);

      const response = await HttpClient.post(
        `${API_BASE_URL}/api/payments/razorpay/order`,
        paymentData
      );

      if (response.data && response.data.orderId) {
        console.log('Razorpay order created successfully:', response.data);
        return { success: true, data: response.data };
      } else {
        console.error('Invalid response from create order API:', response.data);
        return {
          success: false,
          error: 'Failed to create payment order. Invalid response from server.'
        };
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create payment order.'
      };
    }
  }

  // Verify payment after successful payment - FIXED PARAMETER MAPPING
  async verifyPayment(paymentData) {
    try {
      console.log('Verifying Razorpay payment:', paymentData);
      
      // Map frontend parameter names to backend expected names
      const verificationPayload = {
        razorpayOrderId: paymentData.orderId,          // orderId -> razorpayOrderId
        razorpayPaymentId: paymentData.paymentId,      // paymentId -> razorpayPaymentId  
        razorpaySignature: paymentData.signature       // signature -> razorpaySignature
      };
      
      console.log('Mapped verification payload:', verificationPayload);
      
      const response = await HttpClient.post(
        `${API_BASE_URL}/api/payments/razorpay/verify`, 
        verificationPayload
      );

      console.log('Payment verification response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify payment.'
      };
    }
  }

  // Get payment details by payment ID
  async getPaymentDetails(paymentId) {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/payments/razorpay/details?paymentId=${paymentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment details.'
      };
    }
  }

  // Get payment by appointment ID
  async getPaymentByAppointment(appointmentId) {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/payments/razorpay/appointment/${appointmentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching payment details for appointment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment details for appointment.'
      };
    }
  }

  // ===== NEW METHODS FOR BILLS & PAYMENTS =====

  // Get all payments for current user - NEW FOR BILLS & PAYMENTS
  async getUserPayments() {
    try {
      console.log('🔍 Fetching user payments...');
      const response = await HttpClient.get(`${API_BASE_URL}/api/payments/user`);
      console.log('✅ User payments fetched:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error fetching user payments:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user payments.'
      };
    }
  }

  // Get payment summary for current user - NEW FOR BILLS & PAYMENTS
  async getUserPaymentSummary() {
    try {
      console.log('📊 Fetching payment summary...');
      const response = await HttpClient.get(`${API_BASE_URL}/api/payments/summary`);
      console.log('✅ Payment summary fetched:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error fetching payment summary:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment summary.'
      };
    }
  }

  // Download receipt for a payment - NEW FOR BILLS & PAYMENTS
 // FIXED: Download receipt for a payment - CORS ISSUE RESOLVED
  async downloadReceipt(paymentId) {
    try {
      console.log('🧾 Downloading receipt for payment:', paymentId);
      
      // FIXED: Use fetch instead of HttpClient for blob downloads
      const token = localStorage.getItem('token');
      const sessionToken = localStorage.getItem('sessionToken') || localStorage.getItem('session_token');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      };
      
      if (sessionToken) {
        headers['X-Session-Id'] = sessionToken;
      }
      
      // FIXED: Use direct URL construction to avoid HttpClient base URL duplication
      const response = await fetch(`${API_BASE_URL}/api/payments/receipt/${paymentId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Receipt download failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ Receipt downloaded successfully');
      return {
        success: true,
        message: 'Receipt downloaded successfully'
      };
    } catch (error) {
      console.error('❌ Error downloading receipt:', error);
      return {
        success: false,
        error: error.message || 'Failed to download receipt.'
      };
    }
  }

  // Helper methods for formatting - NEW FOR BILLS & PAYMENTS
  formatAmount(amount, currency = 'INR') {
    if (!amount) return '₹0.00';
    
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(parseFloat(amount));
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColorClass(status) {
    switch (status?.toLowerCase()) {
      case 'captured':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      case 'created':
      case 'authorized':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentMethodIcon(method) {
    switch (method?.toLowerCase()) {
      case 'card':
        return 'fas fa-credit-card';
      case 'netbanking':
        return 'fas fa-university';
      case 'wallet':
        return 'fas fa-wallet';
      case 'upi':
        return 'fas fa-mobile-alt';
      default:
        return 'fas fa-money-check-alt';
    }
  }

  // Request refund for a payment
  async requestRefund(paymentId, reason) {
    try {
      const response = await HttpClient.post(`${API_BASE_URL}/api/payments/razorpay/refund`, {
        paymentId,
        reason
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error requesting refund:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to request refund.'
      };
    }
  }

  // Get refund status
  async getRefundStatus(refundId) {
    try {
      const response = await HttpClient.get(`${API_BASE_URL}/api/payments/razorpay/refund/${refundId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching refund status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch refund status.'
      };
    }
  }

  // Load Razorpay script
  loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // Check if Razorpay script is already loaded
  isRazorpayLoaded() {
    return typeof window.Razorpay !== 'undefined';
  }

  // Initialize Razorpay payment window
  async showRazorpayPayment(options) {
    // Make sure Razorpay script is loaded
    if (!this.isRazorpayLoaded()) {
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        return {
          success: false,
          error: 'Failed to load Razorpay script. Please check your internet connection.'
        };
      }
    }

    // Create new Razorpay instance and open payment window
    try {
      return new Promise((resolve) => {
        const razorpayOptions = {
          ...options,
          handler: (response) => {
            resolve({ success: true, data: response });
          },
          modal: {
            ondismiss: () => {
              resolve({ success: false, error: 'Payment window closed by user' });
            }
          }
        };

        const razorpayInstance = new window.Razorpay(razorpayOptions);
        razorpayInstance.open();
      });
    } catch (error) {
      console.error('Error showing Razorpay payment:', error);
      return { success: false, error: error.message || 'Failed to initialize payment.' };
    }
  }
}

export default new RazorpayService();