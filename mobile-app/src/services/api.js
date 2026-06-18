import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your backend URL
// For local dev: 'http://192.168.x.x:5000/api' (use your machine's LAN IP, not localhost)
// For production: 'https://your-backend.onrender.com/api'
export const API_BASE_URL = 'http://localhost:5000/api';
export const SOCKET_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('SecureStore read error', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      // Navigation to login handled by AuthContext listener
    }
    return Promise.reject(error);
  }
);

export default api;
