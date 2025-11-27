import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as api from '../services/api';
import { toast } from 'react-toastify';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // Define a proper user type later
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  register: (userInfo: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you would decode the token here to get user info
      // or fetch user profile from a '/me' endpoint.
      // For now, we rely on the user info being set during login/register.
    }
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await api.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error; // Re-throw to be caught by the page
    }
  };

  const register = async (userInfo: any) => {
    try {
      // We don't log the user in automatically after register in this flow,
      // just notify them of success.
      await api.register(userInfo);
      toast.success('Registration successful! Please log in.');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    toast.info('You have been logged out.');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
