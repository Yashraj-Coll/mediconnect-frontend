import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Base API URL - matches your existing setup
const API_BASE_URL = 'http://localhost:8080/mediconnect/api';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from previous page
  const identifier = location.state?.identifier;
  const otp = location.state?.otp;
  const verified = location.state?.verified;

  // Redirect if not coming from OTP verification
  useEffect(() => {
    if (!identifier || !otp || !verified) {
      navigate('/forgot-password');
    }
  }, [identifier, otp, verified, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return requirements;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    const { newPassword, confirmPassword } = formData;
    
    // Basic validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Password strength validation
    const passwordReqs = validatePassword(newPassword);
    if (!passwordReqs.minLength) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Resetting password for:', identifier);
      
      // Call your Java backend API
      const response = await axios.post(
        `${API_BASE_URL}/auth/password-reset/reset`,
        {
          identifier: identifier,
          otp: otp,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }
      );
      
      console.log('Password reset response:', response.data);
      
      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        
        // Redirect to login page after success
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully! Please login with your new password.' 
            } 
          });
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Invalid request. Please start the process again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordReqs = validatePassword(formData.newPassword);
  const isPasswordValid = formData.newPassword && passwordReqs.minLength;

  if (!identifier || !otp || !verified) {
    return null; // Will redirect
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Create a new strong password for your account
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
                      placeholder="Enter new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className={`text-xs flex items-center ${passwordReqs.minLength ? 'text-green-600' : 'text-red-600'}`}>
                        <i className={`fas ${passwordReqs.minLength ? 'fa-check' : 'fa-times'} mr-2`}></i>
                        At least 8 characters
                      </div>
                      <div className={`text-xs flex items-center ${passwordReqs.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                        <i className={`fas ${passwordReqs.hasUpperCase ? 'fa-check' : 'fa-times'} mr-2`}></i>
                        One uppercase letter (recommended)
                      </div>
                      <div className={`text-xs flex items-center ${passwordReqs.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                        <i className={`fas ${passwordReqs.hasLowerCase ? 'fa-check' : 'fa-times'} mr-2`}></i>
                        One lowercase letter (recommended)
                      </div>
                      <div className={`text-xs flex items-center ${passwordReqs.hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                        <i className={`fas ${passwordReqs.hasNumbers ? 'fa-check' : 'fa-times'} mr-2`}></i>
                        One number (recommended)
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className={`mt-1 text-xs flex items-center ${
                      formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <i className={`fas ${
                        formData.newPassword === formData.confirmPassword ? 'fa-check' : 'fa-times'
                      } mr-2`}></i>
                      {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid || formData.newPassword !== formData.confirmPassword}
                  className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-purple-600 font-medium hover:text-purple-800">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;