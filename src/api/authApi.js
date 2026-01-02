import { MOCK_USERS, generateMockJWT } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const loginAPI = async (email, password) => {
  await delay(500); // Simulate network latency

  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Return what a real backend would return: user info + access token
  return {
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
    token: generateMockJWT(user),
  };
};

// Simulate verifying a token on page refresh
export const verifyTokenAPI = async (token) => {
  await delay(300);
  try {
    // In a real app, the backend verifies the signature. 
    // Here we just decode our fake payload.
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (Date.now() > payload.exp) throw new Error("Token expired");
    
    return { id: payload.id, email: payload.email, role: payload.role, name: payload.name };
  } catch (e) {
    throw new Error("Invalid token");
  }
};