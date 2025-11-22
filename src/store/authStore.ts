import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { User, LoginDTO, CreateUserDTO, AuthResponse } from '../types/api';
import { authApi } from '../services/authApi';

// JWT Claims interface for .NET tokens
interface JwtClaims {
  // Standard .NET Identity claims
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  // Alternative claim names
  sub?: string;
  email?: string;
  name?: string;
  unique_name?: string;
  nameid?: string;
  // Expiration
  exp?: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
  login: (data: LoginDTO) => Promise<AuthResponse>;
  register: (data: CreateUserDTO) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

/**
 * Extracts user information from a JWT token
 */
const getUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JwtClaims>(token);
    console.log('🔓 [AuthStore] Decoded JWT claims:', decoded);

    // Extract user ID from various possible claim names
    const id =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decoded.sub ||
      decoded.nameid ||
      '';

    // Extract email
    const email =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      decoded.email ||
      '';

    // Extract username/name
    const username =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      decoded.name ||
      decoded.unique_name ||
      decoded.sub ||
      '';

    if (!id) {
      console.warn('🔓 [AuthStore] Could not extract user ID from token');
      return null;
    }

    const user: User = { id, email, username };
    console.log('👤 [AuthStore] Extracted user from token:', user);
    return user;
  } catch (error) {
    console.error('🔓 [AuthStore] Failed to decode JWT:', error);
    return null;
  }
};

// Helper functions for chrome.storage.local
const storageGet = async (keys: string[]): Promise<Record<string, string | null>> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        console.log('📦 [AuthStore] Storage get:', keys, result);
        resolve(result as Record<string, string | null>);
      });
    });
  }
  // Fallback to localStorage for development
  const result: Record<string, string | null> = {};
  keys.forEach((key) => {
    result[key] = localStorage.getItem(key);
  });
  console.log('📦 [AuthStore] localStorage get:', keys, result);
  return result;
};

const storageSet = async (data: Record<string, string>): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        console.log('📦 [AuthStore] Storage set:', Object.keys(data));
        resolve();
      });
    });
  }
  // Fallback to localStorage for development
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  console.log('📦 [AuthStore] localStorage set:', Object.keys(data));
};

const storageRemove = async (keys: string[]): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        console.log('📦 [AuthStore] Storage remove:', keys);
        resolve();
      });
    });
  }
  // Fallback to localStorage for development
  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
  console.log('📦 [AuthStore] localStorage remove:', keys);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setTokens: async (accessToken: string, refreshToken: string) => {
    await storageSet({ accessToken, refreshToken });

    // Decode user from token
    const user = getUserFromToken(accessToken);

    // Also persist user to storage
    if (user) {
      await storageSet({ user: JSON.stringify(user) });
    }

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
    });

    console.log('🔐 [AuthStore] Tokens set, user extracted:', { hasUser: !!user, userId: user?.id });
  },

  setUser: async (user: User | null) => {
    if (user) {
      await storageSet({ user: JSON.stringify(user) });
    }
    set({ user });
  },

  clearAuth: async () => {
    await storageRemove(['accessToken', 'refreshToken', 'user']);
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
      const result = await storageGet(['accessToken', 'refreshToken', 'user']);
      const accessToken = result.accessToken || null;
      const refreshToken = result.refreshToken || null;

      let user: User | null = null;

      // First try to decode user from token (most reliable)
      if (accessToken) {
        user = getUserFromToken(accessToken);
      }

      // Fallback: try to load persisted user from storage
      if (!user && result.user) {
        try {
          user = JSON.parse(result.user);
          console.log('👤 [AuthStore] User loaded from storage:', user);
        } catch (e) {
          console.error('👤 [AuthStore] Failed to parse stored user:', e);
        }
      }

      console.log('🔐 [AuthStore] Auth loaded:', {
        hasToken: !!accessToken,
        hasUser: !!user,
        userId: user?.id,
        isAuthenticated: !!accessToken,
      });

      set({
        accessToken,
        refreshToken,
        user,
        isAuthenticated: !!accessToken,
        isLoading: false,
      });
    } catch (error) {
      console.error('🔐 [AuthStore] Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (data: LoginDTO) => {
    const response = await authApi.login(data);
    console.log('🔐 [AuthStore] Login response:', response);

    await get().setTokens(response.accessToken, response.refreshToken);

    // If the API also returns user, use that (it might have more info)
    if (response.user) {
      await get().setUser(response.user);
    }

    return response;
  },

  register: async (data: CreateUserDTO) => {
    const response = await authApi.register(data);
    console.log('🔐 [AuthStore] Register response:', response);
    // Don't auto-login after registration - user requested this
    return response;
  },

  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('🔐 [AuthStore] Logout API call failed:', error);
    }
    await get().clearAuth();
  },
}));

export default useAuthStore;
