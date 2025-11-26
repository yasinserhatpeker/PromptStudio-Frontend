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

    // AGGRESSIVE LOGGING - Critical for debugging
    console.log('🔍 FULL JWT PAYLOAD:', decoded);
    console.log('🔍 FULL JWT PAYLOAD (stringified):', JSON.stringify(decoded, null, 2));
    console.log('🔍 All claim keys:', Object.keys(decoded));
    console.log('🔍 All claim entries:', Object.entries(decoded));

    // Extract user ID from various possible claim names
    const id =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decoded.sub ||
      decoded.nameid ||
      '';

    console.log('🆔 Extracted ID:', id);

    // Extract email
    const email =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      decoded.email ||
      '';

    console.log('📧 Extracted Email:', email);

    // SMARTER USERNAME LOGIC - Try multiple approaches
    console.log('👤 ===== USERNAME EXTRACTION ATTEMPTS =====');

    // Attempt 1: Standard .NET claim
    const attempt1 = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    console.log('  1️⃣ Standard .NET claim (name):', attempt1);

    // Attempt 2: unique_name
    const attempt2 = decoded['unique_name'];
    console.log('  2️⃣ unique_name:', attempt2);

    // Attempt 3: Name (case sensitive)
    const attempt3 = (decoded as any)['Name'];
    console.log('  3️⃣ Name (capitalized):', attempt3);

    // Attempt 4: name (lowercase)
    const attempt4 = decoded.name;
    console.log('  4️⃣ name (lowercase):', attempt4);

    // Attempt 5: sub
    const attempt5 = decoded.sub;
    console.log('  5️⃣ sub:', attempt5);

    // Find first non-empty value
    const foundName = attempt1 || attempt2 || attempt3 || attempt4 || attempt5;
    console.log('  ✅ Found name from claims:', foundName);

    // ULTIMATE FALLBACK: Extract username from email
    let emailName = '';
    if (email) {
      emailName = email.split('@')[0];
      console.log('  📧 Extracted from email:', emailName);
    }

    const username = foundName || emailName || 'Guest';
    console.log('  🎯 FINAL username:', username);
    console.log('==========================================');

    if (!id) {
      console.warn('🔓 [AuthStore] Could not extract user ID from token');
      return null;
    }

    const user: User = { id, email, username };
    console.log('👤 [AuthStore] ===== FINAL USER OBJECT =====');
    console.log('Extracted user from token:', user);
    console.log('==========================================');
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
    console.log('🔄 [AuthStore] ===== LOADING AUTH FROM STORAGE =====');
    set({ isLoading: true });
    try {
      const result = await storageGet(['accessToken', 'refreshToken', 'user']);
      const accessToken = result.accessToken || null;
      const refreshToken = result.refreshToken || null;

      console.log('📦 Retrieved from storage:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasStoredUser: !!result.user,
      });

      let user: User | null = null;

      // First try to decode user from token (most reliable - always fresh)
      if (accessToken) {
        console.log('🔓 Attempting to decode user from access token...');
        user = getUserFromToken(accessToken);

        // If we successfully decoded user from token, update storage
        if (user) {
          console.log('✅ User decoded from token successfully, updating storage...');
          await storageSet({ user: JSON.stringify(user) });
        }
      }

      // Fallback: try to load persisted user from storage
      if (!user && result.user) {
        try {
          console.log('⚠️ Token decode failed, falling back to stored user...');
          user = JSON.parse(result.user);
          console.log('👤 [AuthStore] User loaded from storage fallback:', user);
        } catch (e) {
          console.error('👤 [AuthStore] Failed to parse stored user:', e);
        }
      }

      console.log('🔐 [AuthStore] ===== AUTH LOAD COMPLETE =====');
      console.log('Auth loaded:', {
        hasToken: !!accessToken,
        hasUser: !!user,
        userId: user?.id,
        username: user?.username,
        email: user?.email,
        isAuthenticated: !!accessToken,
      });
      console.log('==========================================');

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
