import axios from 'axios';
import { endpoints } from './endpoints';
import { authService } from './services';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== endpoints.auth.login &&
      originalRequest.url !== endpoints.auth.refresh
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await authService.refresh(refreshToken);

          const { access_token, refresh_token: new_refresh_token } = response.data;

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', new_refresh_token);

          try {
            window.dispatchEvent(new CustomEvent('token_refreshed', { detail: { access_token, refresh_token: new_refresh_token } }));
          } catch (e) {
            
          }

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;