// src/pages/LogoutPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, CheckCircle, AlertCircle, Home, User, ArrowLeft } from 'lucide-react';

const LogoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated, loading } = useAuth();

  // Component state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [countdown, setCountdown] = useState(3);

  // Auto-logout if URL parameter is present
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const autoLogout = urlParams.get('auto');
    
    if (autoLogout === 'true') {
      setShowConfirmation(false);
      handleLogout();
    }
  }, [location]);

  // Only redirect if not authenticated AND not in the middle of logout process
  useEffect(() => {
    if (!isAuthenticated && !loading && logoutStatus !== 'success' && logoutStatus !== 'pending') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, logoutStatus]);

  // Countdown timer for auto-redirect after successful logout
  useEffect(() => {
    let timer;
    if (logoutStatus === 'success' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (logoutStatus === 'success' && countdown === 0) {
      navigate('/', { replace: true });
    }
    
    return () => clearTimeout(timer);
  }, [logoutStatus, countdown, navigate]);

  // Handle logout process
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError('');
      
      console.log('Initiating logout process...');
      
      // Call logout from AuthContext
      await logout();
      
      console.log('Logout successful');
      setLogoutStatus('success');
      setShowConfirmation(false);
      
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout properly. Please try again.');
      setLogoutStatus('error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle cancel logout
  const handleCancel = () => {
    const redirectPath = location.state?.from?.pathname || '/dashboard';
    navigate(redirectPath, { replace: true });
  };

  // Handle redirect to login
  const redirectToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Handle redirect to home
  const redirectToHome = () => {
    navigate('/', { replace: true });
  };

  // Render logout confirmation
  const renderConfirmation = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <LogOut size={40} className="text-purple-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Sign Out
      </h1>
      
      <p className="text-gray-600 mb-2">
        Are you sure you want to sign out
        {user?.firstName && (
          <span className="text-gray-800 font-medium"> {user.firstName}</span>
        )}?
      </p>
      
      <p className="text-gray-500 text-sm mb-8">
        You'll need to sign in again to access your account.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
        >
          {isLoggingOut ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing Out...</span>
            </div>
          ) : (
            <>
              <i className="fas fa-sign-out-alt mr-2"></i>
              Yes, Sign Out
            </>
          )}
        </button>
        
        <button
          onClick={handleCancel}
          disabled={isLoggingOut}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition disabled:opacity-50"
        >
          <i className="fas fa-times mr-2"></i>
          Cancel
        </button>
      </div>
    </div>
  );

  // Render logout success
  const renderSuccess = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Signed Out Successfully
      </h1>
      
      <p className="text-gray-600 mb-2">
        You have been successfully signed out of your account.
      </p>
      
      <p className="text-gray-500 text-sm mb-8">
        Redirecting to home page in {countdown} seconds...
      </p>

      <div className="space-y-4">
        <button
          onClick={redirectToHome}
          className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Go to Home
        </button>
        
        <button
          onClick={redirectToLogin}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <User size={20} />
          Sign In Again
        </button>
      </div>
    </div>
  );

  // Render logout error
  const renderError = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle size={40} className="text-red-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Logout Failed
      </h1>
      
      <p className="text-gray-600 mb-2">
        There was an issue signing you out.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
        >
          {isLoggingOut ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Retrying...</span>
            </div>
          ) : (
            <>
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </>
          )}
        </button>
        
        <button
          onClick={handleCancel}
          disabled={isLoggingOut}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
      </div>
    </div>
  );

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-purple-600 text-2xl font-bold">
            MediConnect
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              {logoutStatus === 'pending' && showConfirmation && renderConfirmation()}
              {logoutStatus === 'success' && renderSuccess()}
              {logoutStatus === 'error' && renderError()}
              
              {/* Show processing state during logout */}
              {isLoggingOut && logoutStatus === 'pending' && !showConfirmation && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Signing Out...
                  </h1>
                  
                  <p className="text-gray-600">
                    Please wait while we sign you out of your account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;