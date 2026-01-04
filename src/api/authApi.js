// src/api/authApi.js
import { MOCK_USERS, generateMockJWT } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loginAPI = async (email, password) => {
  await delay(500); // Simulate network latency

  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // FIXED: Return the FULL user object using the spread operator
  // This ensures indexNumber, address, etc., are passed to the frontend
  return {
    user: { ...user },
    token: generateMockJWT(user),
  };
};

// Simulate verifying a token on page refresh
export const verifyTokenAPI = async (token) => {
  await delay(300);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (Date.now() > payload.exp) throw new Error("Token expired");
    
    // FIXED: Return the full payload instead of picking specific fields
    return { ...payload };
  } catch (e) {
    throw new Error("Invalid token");
  }
};