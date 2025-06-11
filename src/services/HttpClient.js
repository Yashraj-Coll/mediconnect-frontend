import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from '../config/apiConfig';

// Create axios instance WITHOUT default 'Content-Type'
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT || 10000,
  headers: {
    'Accept': 'application/json'
    // Do NOT set 'Content-Type' here!
  }
});

// Add a request interceptor to add token to requests
instance.interceptors.request.use(
  config => {
    console.log('🔍 HttpClient interceptor starting...');
    
    // Get token from localStorage with multiple fallback keys
    let token = localStorage.getItem(STORAGE_KEYS?.TOKEN) || 
                localStorage.getItem('token') || 
                localStorage.getItem('authToken') ||
                localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token found and added to headers');
    } else {
      console.log('❌ NO TOKEN FOUND! Checking authData...');
      
      // Get auth data if available and no direct token found
      const authData = localStorage.getItem('authData');
      if (authData) {
        try {
          const parsedAuthData = JSON.parse(authData);
          if (parsedAuthData.token) {
            config.headers.Authorization = `Bearer ${parsedAuthData.token}`;
            token = parsedAuthData.token;
            console.log('✅ Token found in authData and added');
          }
        } catch (e) {
          console.warn('❌ Error parsing authData:', e);
        }
      }
    }
    
    // Get session token if available
    const sessionToken = localStorage.getItem(STORAGE_KEYS?.SESSION_TOKEN) || 
                        localStorage.getItem('sessionToken') ||
                        localStorage.getItem('session_token');
    if (sessionToken) {
      config.headers['X-Session-Id'] = sessionToken;
      console.log('✅ Session token added to headers');
    } else {
      console.log('❌ NO SESSION TOKEN FOUND!');
    }
    
    // Debug logs - only show first 20 characters of token for security
    console.log('🔑 Using token for request:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log(`📤 Sending ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    // Log all available localStorage keys for debugging
    console.log('🗂️ Available localStorage keys:', Object.keys(localStorage));
    
    // Log all headers being sent
    console.log('📋 Request headers:', {
      Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : 'MISSING',
      'X-Session-Id': config.headers['X-Session-Id'] ? '[REDACTED]' : 'MISSING',
      'Content-Type': config.headers['Content-Type'] || 'NOT SET',
      Accept: config.headers.Accept
    });
    
    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and log responses
instance.interceptors.response.use(
  response => {
    console.log(`✅ Response from ${response.config.url}:`, response.status, response.statusText);
    console.log('📊 Response data:', response.data);
    return response;
  },
  async error => {
    console.error('❌ Response error:', error.response || error);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);

    const originalRequest = error.config;

    // Handle 401 Unauthorized errors - IMPROVED LOGIC
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Got 401 error, checking authentication...');
      
      // For 401 errors, let's be more aggressive about showing the problem
      console.error('🚨 AUTHENTICATION FAILED!');
      console.error('🔍 Current localStorage contents:');
      Object.keys(localStorage).forEach(key => {
        console.log(`  ${key}:`, localStorage.getItem(key) ? '[EXISTS]' : '[MISSING]');
      });
      
      // Try to get refresh token
      const refreshToken = localStorage.getItem(STORAGE_KEYS?.REFRESH_TOKEN) || 
                          localStorage.getItem('refreshToken');
                          
      if (refreshToken) {
        try {
          console.log('🔄 Making refresh token request...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          const { token } = response.data;
          console.log('✅ Token refreshed successfully');
          
          // Update all possible token storage locations
          if (STORAGE_KEYS?.TOKEN) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem('token', token);
          localStorage.setItem('authToken', token);
          localStorage.setItem('accessToken', token);
          
          // Update authData if it exists
          const authData = localStorage.getItem('authData');
          if (authData) {
            try {
              const parsedAuthData = JSON.parse(authData);
              parsedAuthData.token = token;
              localStorage.setItem('authData', JSON.stringify(parsedAuthData));
            } catch (e) {
              console.warn('Error updating authData:', e);
            }
          }
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // ONLY clear tokens if refresh explicitly fails
          if (refreshError.response && (refreshError.response.status === 401 || refreshError.response.status === 403)) {
            console.log('🧹 Clearing authentication data due to refresh failure');
            clearAuthTokens();
            
            // Only redirect if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
              console.log('🔄 Redirecting to login...');
              window.location.href = '/login';
            }
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        console.log('❌ No refresh token available');
        
        // Check if this is a legitimate auth endpoint that should return 401
        const isAuthEndpoint = originalRequest.url && (
          originalRequest.url.includes('/auth/') ||
          originalRequest.url.includes('/login') ||
          originalRequest.url.includes('/register')
        );
        
        if (!isAuthEndpoint) {
          console.log('🧹 Clearing authentication data (no refresh token)');
          clearAuthTokens();
          
          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes('/login')) {
            console.log('🔄 Redirecting to login...');
            alert('Session expired. Please login again.');
            window.location.href = '/login';
          }
        } else {
          console.log('⚠️ 401 on auth endpoint - this is expected, not clearing tokens');
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to clear authentication tokens
function clearAuthTokens() {
  const keysToRemove = [
    'token', 'authToken', 'accessToken', 'refreshToken', 
    'authData', 'user', 'sessionToken', 'session_token'
  ];
  
  // Also remove STORAGE_KEYS if they exist
  if (STORAGE_KEYS) {
    if (STORAGE_KEYS.TOKEN) keysToRemove.push(STORAGE_KEYS.TOKEN);
    if (STORAGE_KEYS.REFRESH_TOKEN) keysToRemove.push(STORAGE_KEYS.REFRESH_TOKEN);
    if (STORAGE_KEYS.USER) keysToRemove.push(STORAGE_KEYS.USER);
    if (STORAGE_KEYS.SESSION_TOKEN) keysToRemove.push(STORAGE_KEYS.SESSION_TOKEN);
  }
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🧹 Removed: ${key}`);
    }
  });
}

// Smart methods: auto-handles JSON vs FormData with enhanced token handling
const HttpClient = {
  get: (url, params = {}) => {
    console.log(`🔍 GET request to: ${url}`);
    return instance.get(url, { params });
  },

  post: (url, data) => {
    console.log(`📝 POST request to: ${url}`);
    if (data instanceof FormData) {
      // No Content-Type for FormData! Let browser set it with boundary
      console.log('📎 Sending FormData...');
      return instance.post(url, data, {
        headers: { 'Accept': 'application/json' }
      });
    }
    // Default to JSON
    console.log('📄 Sending JSON data...');
    return instance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  },

  put: (url, data) => {
    console.log(`✏️ PUT request to: ${url}`);
    if (data instanceof FormData) {
      console.log('📎 Sending FormData...');
      return instance.put(url, data, {
        headers: { 'Accept': 'application/json' }
      });
    }
    console.log('📄 Sending JSON data...');
    return instance.put(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  },

  delete: (url, options = {}) => {
    console.log(`🗑️ DELETE request to: ${url}`);
    // Merge any provided headers with default headers
    const config = {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    };
    
    return instance.delete(url, config);
  }
};

export default HttpClient;