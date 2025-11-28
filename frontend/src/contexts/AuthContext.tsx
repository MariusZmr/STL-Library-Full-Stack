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
      const decodedToken: { id: string; email: string; role: string; exp: number; firstName?: string; lastName?: string } = jwtDecode(jwtToken);
      if (decodedToken.exp * 1000 < Date.now()) { // Check if token is expired
        logout();
        return;
      }
      setToken(jwtToken);
      api.fetchCurrentUserDetails()
        .then(userDetails => {
          setUser(userDetails);
        })
        .catch(error => {
          console.error('Failed to fetch user details after token decode:', error);
          logout(); // Log out if fetching user details fails
        });
    } catch (error) {
      console.error('Failed to decode token:', error);
      logout(); // Log out if token is invalid
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedToken: { exp: number } = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 < Date.now()) { // Check if token is expired
          logout();
          return;
        }
        api.fetchCurrentUserDetails()
          .then(userDetails => {
            setUser(userDetails);
            setToken(storedToken);
          })
          .catch(error => {
            console.error('Failed to fetch user details on auto-login:', error);
            logout(); // Log out if fetching user details fails
          });
      } catch (error) {
        console.error('Error processing stored token:', error);
        logout();
      }
    }
  }, []);

  const login = async (credentials: any) => {
    try {
      const response = await api.login(credentials);
      const token = response.token;
      localStorage.setItem('authToken', token);

      const userDetails = await api.fetchCurrentUserDetails();
      setUser(userDetails);
      setToken(token);

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
