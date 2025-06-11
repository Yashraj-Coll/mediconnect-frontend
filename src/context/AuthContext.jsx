// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS, USER_ENDPOINTS, STORAGE_KEYS } from '../config/apiConfig';

// Set axios base URL for all requests
axios.defaults.baseURL = API_BASE_URL;

// Create context
export const AuthContext = createContext();

// Custom hook to consume AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem(STORAGE_KEYS.TOKEN));

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken   = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        
        console.log('Auth initialized, storedToken exists:', !!storedToken, 'storedSession exists:', !!storedSession);
        
        if (storedToken && storedSession) {
          // Attach headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          axios.defaults.headers.common['X-Session-Id'] = storedSession;

          // FIXED: Use /api/auth/current-user endpoint that includes role
          const resp = await axios.get('/api/auth/current-user');
          console.log('Current user response with role:', resp.data);
          
          setUser(resp.data); // This now includes the role field
          setToken(storedToken);
          setIsAuthenticated(true);
          console.log('User profile loaded with role:', resp.data.role, 'isAuthenticated set to true');
        } else {
          // No valid session
          localStorage.clear();
          delete axios.defaults.headers.common['Authorization'];
          delete axios.defaults.headers.common['X-Session-Id'];
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          console.log('No valid session found, isAuthenticated set to false');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['X-Session-Id'];
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // FIXED: Login method to handle new response format
  const login = async (identifier, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting login with identifier:', identifier);
      
      const resp = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        identifier,
        password,
        rememberMe
      });

      console.log('Login API response received:', resp.status);
      console.log('Login response data:', resp.data);

      // FIXED: Extract data from new response format
      const { token: authToken, sessionToken, user: userData } = resp.data;

      // Persist to localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      // Attach headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      axios.defaults.headers.common['X-Session-Id'] = sessionToken;

      // Update state
      setToken(authToken);
      setUser(userData); // This now includes the role field
      setIsAuthenticated(true);
      
      console.log('Login successful, user set:', userData.id, 'with role:', userData.role, 'isAuthenticated set to true');

      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      // Optionally notify server
      const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      if (sessionId) {
        await axios.post(AUTH_ENDPOINTS.LOGOUT, null, { params: { sessionId } });
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['X-Session-Id'];
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  const value = { user, token, loading, error, isAuthenticated, login, logout };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;