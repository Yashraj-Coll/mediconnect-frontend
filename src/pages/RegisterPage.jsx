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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    // Phone number validation - make sure it's 10 digits
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    try {
      setLoading(true);
      
      // Split the name into first and last name
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Backend expects roles as an array of enum values
      const roles = ['ROLE_PATIENT']; // Default to patient role
      
      // Create request payload
      const signupRequest = {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
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
        // After successful registration, redirect to login
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Registration successful! Please login with your credentials.' 
          } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
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
              {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
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
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Confirm your password"
                  />
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
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary text-white py-3 rounded-lg font-medium hover:shadow-lg transition"
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