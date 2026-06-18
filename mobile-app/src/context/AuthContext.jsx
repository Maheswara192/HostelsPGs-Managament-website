import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import authService from '../services/auth.service';
import { initSocket, disconnectSocket } from '../services/socket.service';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app launch: verify stored token
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            initSocket(token);
          } else {
            await SecureStore.deleteItemAsync('token');
          }
        }
      } catch (err) {
        console.error('Session verify failed', err);
        await SecureStore.deleteItemAsync('token');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.data);
        initSocket(response.data.token);
        return { success: true, role: response.data.role };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK'
          ? 'Cannot connect to server. Check your network.'
          : error.message || 'Login failed');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    disconnectSocket();
  };

  const registerOwner = async (name, email, password, pgName) => {
    try {
      const response = await authService.registerOwner(name, email, password, pgName);
      if (response.success) {
        setUser(response.data);
        initSocket(response.data.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK'
          ? 'Cannot connect to server. Check your network.'
          : error.message || 'Registration failed');
      return { success: false, message: msg };
    }
  };

  const setupAccount = async (token, password) => {
    try {
      const response = await authService.setupAccount(token, password);
      if (response.success) {
        setUser(response.data);
        initSocket(response.data.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK'
          ? 'Cannot connect to server. Check your network.'
          : error.message || 'Account activation failed');
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerOwner, setupAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
