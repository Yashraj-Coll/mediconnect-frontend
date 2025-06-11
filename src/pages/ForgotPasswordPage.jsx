import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Base API URL - update this to match your backend
const API_BASE_URL = 'http://localhost:8080/mediconnect/api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Reset password
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Timer for resend OTP
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (step === 2) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/send-otp`, {
        identifier: identifier.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep(2);
        setCountdown(60); // 60 seconds before allowing resend
        setCanResend(false);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/verify-otp`, {
        identifier: identifier.trim(),
        otp: otp.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/reset`, {
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please login with your new password.' 
            } 
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/resend-otp`, {
        identifier: identifier.trim()
      });

      if (response.data.success) {
        setSuccess('OTP resent successfully');
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        {[1, 2, 3].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= stepNum ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-8 h-1 mx-2 ${
                step > stepNum ? 'bg-purple-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
            <p className="text-gray-600">
              {step === 1 && "Enter your email or phone number to receive an OTP"}
              {step === 2 && "Enter the OTP sent to your email/phone"}
              {step === 3 && "Create your new password"}
            </p>
          </div>

          {renderStepIndicator()}

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

              {/* STEP 1: Enter Email/Phone */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Email or Phone Number</label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Enter your email or phone number"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Verify OTP */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only digits
                        if (value.length <= 6) {
                          setOtp(value);
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the 6-digit code sent to {identifier}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>

                  <div className="text-center">
                    {!canResend ? (
                      <p className="text-sm text-gray-500">
                        Resend OTP in {countdown} seconds
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Didn't receive OTP? Resend
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    ← Back to enter email/phone
                  </button>
                </form>
              )}

              {/* STEP 3: Reset Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Enter new password"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
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

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                  >
                    ← Back to verify OTP
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-purple-600 font-medium hover:text-purple-800">
                    Sign in
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

export default ForgotPasswordPage;