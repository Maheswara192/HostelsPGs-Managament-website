import api from './api';
import * as SecureStore from 'expo-secure-store';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data?.token) {
      await SecureStore.setItemAsync('token', response.data.data.token);
    }
    return response.data;
  },

  registerOwner: async (name, email, password, pgName) => {
    const response = await api.post('/auth/register', { name, email, password, pgName, role: 'owner' });
    if (response.data.success && response.data.data?.token) {
      await SecureStore.setItemAsync('token', response.data.data.token);
    }
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setupAccount: async (token, password) => {
    const response = await api.post('/auth/setup-account', { token, password });
    if (response.data.success && response.data.data?.token) {
      await SecureStore.setItemAsync('token', response.data.data.token);
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, otp, password) => {
    const response = await api.post('/auth/reset-password', { email, otp, password });
    return response.data;
  },
};

export default authService;
