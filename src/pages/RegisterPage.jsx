import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Base API URL - update this to match your backend
const API_BASE_URL = 'http://localhost:8080/mediconnect/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: 'Password Strength: Weak',
    color: 'text-red-500'
  });
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 20;
    
    // Number check
    if (/[0-9]/.test(password)) strength += 20;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    let strengthData = {};
    if (strength <= 40) {
      strengthData = {
        score: strength,
        text: 'Password Strength: Weak',
        color: 'text-red-500',
        bgColor: 'bg-red-500'
      };
    } else if (strength <= 80) {
      strengthData = {
        score: strength,
        text: 'Password Strength: Good',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500'
      };
    } else {
      strengthData = {
        score: strength,
        text: 'Password Strength: Strong',
        color: 'text-green-500',
        bgColor: 'bg-green-500'
      };
    }
    
    setPasswordStrength(strengthData);
  };

  // Show error with auto-hide after 3 seconds
  const showError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    setTimeout(() => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }, 3000);
  };

  // Show success message with auto-hide after 4 seconds
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }

    // Check password strength in real-time
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Validate name (only letters and spaces)
    if (!formData.name.trim()) {
      showError('name', 'Please enter your full name');
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      showError('name', 'Please enter a valid name (letters only)');
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      showError('email', 'Please enter your email address');
      isValid = false;
    } else if (!emailRegex.test(formData.email.trim())) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }

    // Validate mobile number
    if (!formData.phone.trim()) {
      showError('phone', 'Please enter your mobile number');
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      showError('phone', 'Please enter a valid 10-digit mobile number');
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      showError('password', 'Please enter a password');
      isValid = false;
    } else if (formData.password.length < 6) {
      showError('password', 'Password must be at least 6 characters long');
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      showError('confirmPassword', 'Please confirm your password');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      showError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    // Validate terms acceptance
    if (!formData.acceptTerms) {
      showError('acceptTerms', 'Please accept the terms and conditions');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Split the name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Backend expects roles as an array of enum values
      const roles = ['ROLE_PATIENT']; // Default to patient role
      
      // Create request payload
      const signupRequest = {
        firstName,
        lastName,
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phone.trim(),
        roles
      };
      
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/signup`);
      console.log('Request payload:', signupRequest);
      
      // Make signup request
      const response = await axios.post(
        `${API_BASE_URL}/auth/signup`, 
        signupRequest
      );
      
      console.log('Registration response:', response);
      
      if (response.status === 200) {
        // Show success message
        showSuccess('Account created successfully! Redirecting to login...');
        
        // Extended delay to show the success message before redirect
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { 
              message: 'Registration successful! Please login with your credentials.',
              type: 'success'
            } 
          });
        }, 3000); // Increased to 3 seconds for better visibility
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
          showError('email', 'Account already exists with this email. Please try logging in.');
          setTimeout(() => {
            navigate('/login');
          }, 3000); // Increased to 3 seconds
        } else if (errorMessage.toLowerCase().includes('phone') && errorMessage.toLowerCase().includes('exists')) {
          showError('phone', 'Account already exists with this mobile number. Please try logging in.');
          setTimeout(() => {
            navigate('/login');
          }, 3000); // Increased to 3 seconds
        } else {
          showError('general', errorMessage);
        }
      } else {
        showError('general', 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join MediConnect for better healthcare</p>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  {successMessage}
                </div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm animate-pulse">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm mt-1 block animate-pulse">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm mt-1 block animate-pulse">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Mobile Number</label>
                  <div className="flex">
                    <div className="bg-gray-100 p-3 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                      +91
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-red-500 text-sm mt-1 block animate-pulse">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-12"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.bgColor}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs mt-1 block ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                  
                  {errors.password && (
                    <span className="text-red-500 text-sm mt-1 block animate-pulse">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.password}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm mt-1 block animate-pulse">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      I agree to the <a href="#" className="text-purple-600 hover:text-purple-800">Terms of Service</a> and <a href="#" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
                    </label>
                    {errors.acceptTerms && (
                      <div className="text-red-500 text-sm mt-1 animate-pulse">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.acceptTerms}
                      </div>
                    )}
                  </div>
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
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
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

export default RegisterPage;