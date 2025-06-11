// src/config/env.js

// Centralized environment configuration
const env = {
    
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/mediconnect',
    REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '30000'),
    ENABLE_AI_CHAT: import.meta.env.VITE_ENABLE_AI_CHAT === 'true',
    ENABLE_VIDEO_CONSULTATION: import.meta.env.VITE_ENABLE_VIDEO_CONSULTATION === 'true',
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
    NODE_ENV: import.meta.env.MODE,
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production',
  };
  
  export default env;