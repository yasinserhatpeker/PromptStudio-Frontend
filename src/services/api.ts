import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Hardcoded base URL to avoid any relative path issues
const API_BASE_URL = 'http://localhost:5119';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Retrieves the access token from chrome.storage.local
 * The token is stored directly with key 'accessToken'
 */
const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    // Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['accessToken'], (result: { accessToken?: string }) => {
          const token = result?.accessToken || null;
          console.log('🔑 [Storage] accessToken:', token ? `Found (${token.substring(0, 15)}...)` : 'MISSING');
          resolve(token);
        });
      });
    }

    // Fallback for development (localStorage)
    const token = localStorage.getItem('accessToken');
    console.log('🔑 [localStorage] accessToken:', token ? `Found (${token.substring(0, 15)}...)` : 'MISSING');
    return token;
  } catch (error) {
    console.error('🔑 [Storage] Error retrieving token:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token from chrome.storage.local
 */
const getRefreshTokenFromStorage = async (): Promise<string | null> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['refreshToken'], (result: { refreshToken?: string }) => {
          resolve(result?.refreshToken || null);
        });
      });
    }
    return localStorage.getItem('refreshToken');
  } catch (error) {
    console.error('🔑 [Storage] Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Saves tokens to storage
 */
const saveTokensToStorage = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ accessToken, refreshToken }, () => {
          console.log('🔑 [Storage] Tokens saved successfully');
          resolve();
        });
      });
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  } catch (error) {
    console.error('🔑 [Storage] Error saving tokens:', error);
  }
};

/**
 * Clears tokens from storage
 */
const clearTokensFromStorage = async (): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(['accessToken', 'refreshToken', 'user'], () => {
          console.log('🔑 [Storage] Tokens cleared');
          resolve();
        });
      });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('🔑 [Storage] Error clearing tokens:', error);
  }
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('🌐 [API] Request:', config.method?.toUpperCase(), config.url);

    const token = await getTokenFromStorage();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [Interceptor] Token attached: YES');
    } else {
      console.log('🔑 [Interceptor] Token attached: NO (missing)');
    }

    return config;
  },
  (error) => {
    console.error('🌐 [API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => {
    console.log('🌐 [API] Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    console.log('🌐 [API] Error:', error.response?.status, error.config?.url);

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 [Interceptor] 401 received, attempting token refresh...');

      try {
        const refreshToken = await getRefreshTokenFromStorage();

        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_BASE_URL}/api/Auth/refresh`, {
            refreshToken: refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          console.log('🔄 [Interceptor] Token refresh successful');

          await saveTokensToStorage(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          console.log('🔄 [Interceptor] No refresh token available');
        }
      } catch (refreshError) {
        console.error('🔄 [Interceptor] Token refresh failed:', refreshError);
        await clearTokensFromStorage();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
