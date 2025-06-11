import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Base API URL - matches your existing setup
const API_BASE_URL = 'http://localhost:8080/mediconnect/api';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const otpRefs = useRef([]);
  
  // Get identifier from previous page
  const identifier = location.state?.identifier;
  const expiryMinutes = location.state?.expiryMinutes || 15;

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      navigate('/forgot-password');
    }
  }, [identifier, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus last filled input or first empty one
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    otpRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    const otpString = otp.join('');
    
    // Validation
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Verifying OTP:', otpString, 'for identifier:', identifier);
      
      // Call your Java backend API
      const response = await axios.post(
        `${API_BASE_URL}/auth/password-reset/verify-otp`,
        { 
          identifier: identifier,
          otp: otpString
        }
      );
      
      console.log('OTP verification response:', response.data);
      
      if (response.data.success) {
        setSuccess('OTP verified successfully! Redirecting...');
        
        // Redirect to reset password page
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { 
              identifier: identifier,
              otp: otpString,
              verified: true
            } 
          });
        }, 1500);
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Resending OTP for:', identifier);
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/password-reset/resend-otp`,
        { identifier: identifier }
      );
      
      console.log('Resend OTP response:', response.data);
      
      if (response.data.success) {
        setSuccess('New OTP sent successfully!');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        otpRefs.current[0]?.focus(); // Focus first input
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const isEmail = (value) => {
    return value && value.includes('@');
  };

  if (!identifier) {
    return null; // Will redirect
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
            <p className="text-gray-600">
              We've sent a 6-digit OTP to your {isEmail(identifier) ? 'email' : 'phone number'}
            </p>
            <p className="text-sm text-purple-600 mt-2">
              {identifier}
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-3 text-center">Enter OTP</label>
                  <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => otpRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Time remaining: <span className="font-mono text-purple-600">{formatTime(timeLeft)}</span>
                  </p>
                  
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      {resendLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Didn't receive the OTP? You can resend in {formatTime(timeLeft)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying OTP...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Want to try a different email/phone?{' '}
                  <Link to="/forgot-password" className="text-purple-600 font-medium hover:text-purple-800">
                    Go Back
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

export default VerifyOtpPage;