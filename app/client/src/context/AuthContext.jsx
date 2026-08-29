import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rfgc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rfgc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rfgc_user');
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.login(username, password);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      } else {
        throw new Error(res.error || 'Login failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid username or password');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rfgc_user');
  };

  // Direct switch helper for fast auditioning and testing
  const switchUserDirect = (userData) => {
    setUser(userData);
  };

  const isSecretary = user?.role === 'secretary';
  const isPastor = user?.role === 'pastor';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        logout,
        switchUserDirect,
        isSecretary,
        isPastor,
        isAdmin,
      }}
    >
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
