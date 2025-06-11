import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');  // email or phone
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);   // remember-me checkbox
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

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

  // Get redirect URL based on user role
  const getRedirectUrl = (userRole) => {
    const urlParams = new URLSearchParams(location.search);
    const redirectUrl = urlParams.get('redirect');
    
    // If there's a specific redirect URL, use it
    if (redirectUrl && redirectUrl !== '/login') {
      return redirectUrl;
    }
    
    // Otherwise, redirect based on role
    switch (userRole?.toUpperCase()) {
      case 'PATIENT':
        return '/patient-dashboard';
      case 'DOCTOR':
        return '/doctor-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/dashboard'; // This will trigger role-based redirect
    }
  };

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      if (location.state?.type === 'success') {
        setSuccessMessage(location.state.message);
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        showError('general', location.state.message);
      }
      // Clear the state to prevent showing the message on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Redirect if already authenticated (but not during login success flow)
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      const redirectUrl = getRedirectUrl(user.role);
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.search, isRedirecting]);

  // Check for URL parameters on page load (for JSP-style error handling)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      if (error === 'unregistered') {
        showError('identifier', 'This email/mobile number is not registered with us. Please signup first.');
      } else if (error === 'invalid_password') {
        showError('password', 'Incorrect password. Please try again.');
      }
    }
  }, []);

  const validateForm = () => {
    let isValid = true;

    // Validate identifier (email or phone)
    if (!identifier.trim()) {
      showError('identifier', 'Please enter your email or phone number');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[0-9]{10}$/;
      
      if (!emailRegex.test(identifier.trim()) && !mobileRegex.test(identifier.trim())) {
        showError('identifier', 'Please enter a valid email address or mobile number');
        isValid = false;
      }
    }

    // Validate password
    if (!password) {
      showError('password', 'Please enter your password');
      isValid = false;
    }

    return isValid;
  };

  const handleChange = (field, value) => {
    if (field === 'identifier') {
      setIdentifier(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }

    // Reset redirecting state when user starts typing
    if (isRedirecting) {
      setIsRedirecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      console.log('Calling login with identifier:', identifier);
      const result = await login(identifier.trim(), password, rememberMe);
      console.log('Login result:', result);

      if (result.success) {
        // Set redirecting flag to prevent auto-redirect useEffect
        setIsRedirecting(true);
        
        // Show success message
        showSuccess('Logged in successfully! Redirecting...');
        
        // Short delay to show the success message before redirect
        setTimeout(() => {
          const redirectUrl = getRedirectUrl(result.user.role);
          console.log('Login successful, redirecting to:', redirectUrl);
          navigate(redirectUrl, { replace: true });
        }, 2500); // Increased to 2.5 seconds for better visibility
        
      } else {
        console.log('Login failed:', result.error);
        
        // Handle specific error types
        if (result.error === 'UNREGISTERED' || result.error?.toLowerCase().includes('not registered')) {
          showError('identifier', 'This email/mobile number is not registered with us. Please signup first.');
        } else if (result.error === 'INVALID_PASSWORD' || result.error?.toLowerCase().includes('password')) {
          showError('password', 'Incorrect password. Please try again.');
        } else if (result.error?.toLowerCase().includes('account') && result.error?.toLowerCase().includes('locked')) {
          showError('general', 'Your account has been locked. Please contact support.');
        } else {
          showError('general', result.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      showError('general', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your MediConnect account</p>
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
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Email or Phone</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => handleChange('identifier', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter your email or phone"
                  />
                  {errors.identifier && (
                    <span className="text-red-500 text-sm mt-1 block">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.identifier}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-gray-700">Password</label>
                    <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-sm mt-1 block">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
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
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-600 font-medium hover:text-purple-800">
                    Sign up
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

export default LoginPage;