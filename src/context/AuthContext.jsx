import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

// Create a custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/mediconnect';
  axios.defaults.baseURL = apiBaseUrl;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setLoading(false);
          return;
        }
        
        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Fetch current user
        const response = await axios.get('/api/auth/user');
        
        if (response.status === 200 && response.data) {
          setUser(response.data);
          setToken(storedToken);
        } else {
          // Invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear invalid auth data
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct endpoint based on your backend API
      const response = await axios.post('/api/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      
      if (response.status === 200 && response.data) {
        // Extract token - check for different possible structures
        const authToken = response.data.token || response.data.type;
        
        // The user data might be directly in response.data
        const userData = response.data;
        
        // Store token
        localStorage.setItem('token', authToken);
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        // Update state
        setToken(authToken);
        setUser(userData);
        
        // Only store userId if it exists
        if (userData && userData.id) {
          localStorage.setItem('userId', userData.id);
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setToken(null);
    setUser(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/signup', userData);
      
      if (response.status === 201 || response.status === 200) {
        return { success: true, data: response.data };
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      const response = await axios.put(`/api/users/${user.id}/profile`, profileData);
      
      if (response.status === 200 && response.data) {
        // Update user state with new profile data
        setUser({
          ...user,
          ...response.data
        });
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Profile update failed');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Upload profile image
  const uploadProfileImage = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(`/api/users/${user.id}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200 && response.data) {
        // Update user with new profile image URL
        setUser({
          ...user,
          profileImage: response.data.profileImage
        });
        
        return { success: true, imageUrl: response.data.profileImage };
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMessage = err.response?.data?.message || 'Image upload failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role === roleName || role.name === roleName);
  };

  // Auth context value
  const authContextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    register,
    updateProfile,
    uploadProfileImage,
    hasRole
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;