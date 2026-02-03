import { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Crucial for preventing flicker

  // On App Start: Check if a token exists and verify it
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authApi.verifyTokenAPI(token);
          setUser(userData);
        } catch (error) {
          authService.removeToken(); // Token invalid/expired
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authApi.loginAPI(email, password);
      authService.setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};