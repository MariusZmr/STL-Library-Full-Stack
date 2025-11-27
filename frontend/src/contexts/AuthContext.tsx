import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as api from '../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

// Define User type for better type safety
interface UserType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // Add role
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null; // Use UserType
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  register: (userInfo: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null); // Use UserType
  const [token, setToken] = useState<string | null>(null);

  // Function to decode token and set user data
  const decodeAndSetUser = (jwtToken: string) => {
    try {
      const decodedToken: { id: string; email: string; role: string; firstName: string; lastName: string } = jwtDecode(jwtToken);
      setUser({
        id: decodedToken.id,
        email: decodedToken.email,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        role: decodedToken.role,
      });
      setToken(jwtToken);
    } catch (error) {
      console.error('Failed to decode token:', error);
      logout(); // Log out if token is invalid
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      decodeAndSetUser(storedToken); // Decode stored token on load
    }
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await api.login(credentials);
      // Backend now returns token and user, user object has role
      decodeAndSetUser(response.token); // Decode and set user from response token
      localStorage.setItem('authToken', response.token);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (userInfo: any) => {
    try {
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
