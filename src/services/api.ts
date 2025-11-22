import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5119';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Try to get token from chrome.storage.local if available
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get(['accessToken']);
        if (result.accessToken) {
          config.headers.Authorization = `Bearer ${result.accessToken}`;
        }
      }
    } catch (error) {
      // Silently fail if chrome.storage is not available (e.g., during development)
      console.warn('Chrome storage not available:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await chrome.storage.local.get(['refreshToken']);

          if (result.refreshToken) {
            // Call refresh endpoint
            const refreshResponse = await axios.post(`${API_BASE_URL}/api/Auth/refresh`, {
              refreshToken: result.refreshToken,
            });

            const { accessToken, refreshToken } = refreshResponse.data;

            // Store new tokens
            await chrome.storage.local.set({ accessToken, refreshToken });

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          await chrome.storage.local.remove(['accessToken', 'refreshToken']);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
