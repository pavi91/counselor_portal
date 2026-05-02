import apiClient from './apiClient';

export const loginAPI = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  
  // Return format must match what AuthContext.jsx expects
  return {
    user: response.data.user,
    token: response.data.token
  };
};

export const verifyTokenAPI = async (token) => {
  const response = await apiClient.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};