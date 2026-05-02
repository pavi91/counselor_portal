import axios from 'axios';
import { getToken } from '../services/authService';

const API_URL = 'http://localhost:5000/api';

const pickErrorMessages = (data) => {
  if (!data) return [];

  if (Array.isArray(data.messages)) {
    return data.messages.filter(Boolean).map(String);
  }

  if (Array.isArray(data.errors)) {
    return data.errors.filter(Boolean).map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item.message === 'string') return item.message;
      return '';
    }).filter(Boolean);
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return [data.message.trim()];
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return [data.error.trim()];
  }

  return [];
};

const defaultMessageByStatus = (status) => {
  if (status === 400) return 'Invalid request. Please check your input and try again.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'Requested resource was not found.';
  if (status === 409) return 'This action conflicts with existing data.';
  if (status === 422) return 'Submitted data is not valid.';
  if (status >= 500) return 'Server error. Please try again in a moment.';
  return 'Something went wrong. Please try again.';
};

export const getApiErrorMessages = (error) => {
  if (!error) return [];
  if (Array.isArray(error.backendMessages) && error.backendMessages.length > 0) {
    return error.backendMessages;
  }
  const responseData = error.response?.data;
  return pickErrorMessages(responseData);
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const messages = getApiErrorMessages(error);
  if (messages.length > 0) return messages[0];

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error?.statusCode === 'number') {
    return defaultMessageByStatus(error.statusCode);
  }

  if (typeof error?.response?.status === 'number') {
    return defaultMessageByStatus(error.response.status);
  }

  return fallback;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL
});

// Add token to requests automatically
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData - let axios set it automatically
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.backendMessages = ['Unable to reach the server. Please check your connection.'];
      error.statusCode = 0;
      error.message = error.backendMessages[0];
      return Promise.reject(error);
    }

    const statusCode = error.response.status;
    const backendMessages = pickErrorMessages(error.response.data);
    const message = backendMessages[0] || defaultMessageByStatus(statusCode);

    error.statusCode = statusCode;
    error.backendMessages = backendMessages;
    error.message = message;

    return Promise.reject(error);
  }
);

export default apiClient;
