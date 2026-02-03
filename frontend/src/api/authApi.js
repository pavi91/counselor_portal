import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const loginAPI = async (email, password) => {
  // Replace the mock logic with a real POST request
  const response = await axios.post(`${API_URL}/login`, { email, password });
  
  // Return format must match what AuthContext.jsx expects
  return {
    user: response.data.user,
    token: response.data.token
  };
};

export const verifyTokenAPI = async (token) => {
  const response = await axios.get(`${API_URL}/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};