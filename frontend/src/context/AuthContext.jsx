import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agri_token') || null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiCall('/auth/me');
        if (data.success) {
          setUser(data.user);
        } else {
          logout(false);
        }
      } catch (err) {
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', 'POST', { email, password });
      if (data.success) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(data.message || 'Logged in successfully!', 'success');
        return data.user;
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const data = await apiCall('/auth/register', 'POST', formData);
      if (data.success) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Registration successful! Welcome to KrishiDirect.', 'success');
        return data.user;
      }
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const googleLogin = async ({ email, name, avatar, role }) => {
    try {
      const data = await apiCall('/auth/google', 'POST', { email, name, avatar, role });
      if (data.success) {
        localStorage.setItem('agri_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(data.message || 'Authenticated with Google successfully!', 'success');
        return data.user;
      }
    } catch (err) {
      showToast(err.message || 'Google authentication failed.', 'error');
      throw err;
    }
  };

  const logout = (notify = true) => {
    localStorage.removeItem('agri_token');
    setToken(null);
    setUser(null);
    if (notify) {
      showToast('Logged out safely.', 'info');
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const data = await apiCall('/auth/profile', 'PUT', updateData);
      if (data.success) {
        setUser(data.user);
        showToast('Profile updated successfully.', 'success');
        return data.user;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
