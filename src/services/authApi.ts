import api from './api';
import type {
  CreateUserDTO,
  LoginDTO,
  LogoutDTO,
  RefreshTokenDTO,
  AuthResponse,
} from '../types/api';

export const authApi = {
  /**
   * POST /api/Auth/register
   * Register a new user
   */
  register: async (data: CreateUserDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/Auth/register', data);
    return response.data;
  },

  /**
   * POST /api/Auth/login
   * Login with email and password
   */
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/Auth/login', data);
    return response.data;
  },

  /**
   * POST /api/Auth/logout
   * Logout and invalidate refresh token
   */
  logout: async (data: LogoutDTO): Promise<void> => {
    await api.post('/api/Auth/logout', data);
  },

  /**
   * POST /api/Auth/refresh
   * Refresh access token using refresh token
   */
  refresh: async (data: RefreshTokenDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/Auth/refresh', data);
    return response.data;
  },
};

export default authApi;
