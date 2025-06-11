import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'requiredRole:', requiredRole);
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - User Role:', user?.role);

  // If still loading authentication status, show loading spinner
  if (loading) {
    return (
      <div className="pt-32 pb-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page with return URL
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate 
      to={`/login?redirect=${encodeURIComponent(location.pathname)}`} 
      replace 
    />;
  }

  // If no specific role is required, allow access
  if (!requiredRole) {
    console.log('No role required, rendering protected content');
    return children;
  }

  // Check if user has the required role
  // Handle different possible role formats: ROLE_PATIENT, PATIENT, etc.
  const userRole = user?.role || user?.userRole || user?.type || 'PATIENT';
  let normalizedUserRole = userRole.toUpperCase();
  
  // Remove ROLE_ prefix if present for comparison
  if (normalizedUserRole.startsWith('ROLE_')) {
    normalizedUserRole = normalizedUserRole.substring(5);
  }
  
  let normalizedRequiredRole = requiredRole.toUpperCase();
  if (normalizedRequiredRole.startsWith('ROLE_')) {
    normalizedRequiredRole = normalizedRequiredRole.substring(5);
  }

  console.log('Checking role - User:', normalizedUserRole, 'Required:', normalizedRequiredRole);

  if (normalizedUserRole !== normalizedRequiredRole) {
    console.log('Role mismatch, redirecting to appropriate dashboard');
    // Redirect to appropriate dashboard based on user's actual role
    switch (normalizedUserRole) {
      case 'PATIENT':
        return <Navigate to="/patient-dashboard" replace />;
      case 'DOCTOR':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/patient-dashboard" replace />;
    }
  }

  // User has the required role, render the protected component
  console.log('Role matches, rendering protected content');
  return children;
};

export default ProtectedRoute;