// src/config.js
// Centralized configuration for API endpoints

// Base API Gateway URL
const API_GATEWAY = process.env.REACT_APP_API_GATEWAY || 'https://fu9nj81we9.execute-api.eu-west-1.amazonaws.com';
const API_BRANCH = process.env.REACT_APP_API_GATEWAY_BRANCH || 'testing';

// API endpoints
const API_ENDPOINTS = {
  // Base URL with branch
  BASE_URL: `${API_GATEWAY}/${API_BRANCH}`,
  
  // Specific endpoints
  FILES: `${API_GATEWAY}/${API_BRANCH}/${process.env.REACT_APP_API_GATEWAY_FILES || 'files'}`,
  TRANSCRIBE: `${API_GATEWAY}/${API_BRANCH}/${process.env.REACT_APP_API_GATEWAY_TRANSCRIBE || 'transcribe'}`,
  BEDROCK: `${API_GATEWAY}/${API_BRANCH}/${process.env.REACT_APP_API_GATEWAY_BEDROCK || 'bedrock'}`,
  UPLOAD: `${API_GATEWAY}/${API_BRANCH}/${process.env.REACT_APP_API_GATEWAY_UPLOAD || 'upload'}`,
  DELETE: `${API_GATEWAY}/${API_BRANCH}/${process.env.REACT_APP_API_GATEWAY_DELETE || 'delete'}`,
};

// API key
const API_KEY = process.env.REACT_APP_API_KEY || '';

// Helper function to build URLs with query parameters
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export {
  API_ENDPOINTS,
  API_KEY,
  buildUrl
}; 