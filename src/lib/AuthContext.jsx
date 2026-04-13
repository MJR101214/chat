import React, { createContext, useState, useContext, useEffect } from 'react';
import { localClient } from '@/api/localClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      // Check if user is authenticated via local storage
      const currentUser = await localClient.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Failed to check authentication'
      });
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const userData = await localClient.auth.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Login failed'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await localClient.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      const newUser = await localClient.auth.register(userData);
      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (error) {
      setAuthError({
        type: 'registration_failed',
        message: error.message || 'Registration failed'
      });
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
    login,
    logout,
    register,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
