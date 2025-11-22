import { create } from 'zustand';
import type { User, LoginDTO, CreateUserDTO, AuthResponse } from '../types/api';
import { authApi } from '../services/authApi';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User | null) => void;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
  login: (data: LoginDTO) => Promise<AuthResponse>;
  register: (data: CreateUserDTO) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

// Helper functions for chrome.storage.local
const storageGet = async (keys: string[]): Promise<Record<string, string | null>> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result as Record<string, string | null>);
      });
    });
  }
  // Fallback to localStorage for development
  const result: Record<string, string | null> = {};
  keys.forEach((key) => {
    result[key] = localStorage.getItem(key);
  });
  return result;
};

const storageSet = async (data: Record<string, string>): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  }
  // Fallback to localStorage for development
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

const storageRemove = async (keys: string[]): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  }
  // Fallback to localStorage for development
  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: async (accessToken: string, refreshToken: string) => {
    await storageSet({ accessToken, refreshToken });
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  clearAuth: async () => {
    await storageRemove(['accessToken', 'refreshToken']);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  loadAuth: async () => {
    set({ isLoading: true });
    try {
      const result = await storageGet(['accessToken', 'refreshToken']);
      const accessToken = result.accessToken || null;
      const refreshToken = result.refreshToken || null;

      set({
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (data: LoginDTO) => {
    const response = await authApi.login(data);
    await get().setTokens(response.accessToken, response.refreshToken);
    if (response.user) {
      set({ user: response.user });
    }
    return response;
  },

  register: async (data: CreateUserDTO) => {
    const response = await authApi.register(data);
    await get().setTokens(response.accessToken, response.refreshToken);
    if (response.user) {
      set({ user: response.user });
    }
    return response;
  },

  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    await get().clearAuth();
  },
}));

export default useAuthStore;
