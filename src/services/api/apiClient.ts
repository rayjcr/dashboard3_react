import axios from 'axios';
import { useAuthStore } from '@/stores';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000, // 120 seconds
});

// Request interceptor - Add Authorization header
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, trigger logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
