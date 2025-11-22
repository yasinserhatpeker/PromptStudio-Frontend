import api from './api';
import type { CreateUserDTO, UpdateUserDTO, User } from '../types/api';

export const userApi = {
  /**
   * POST /api/User
   * Create a new user
   */
  create: async (data: CreateUserDTO): Promise<User> => {
    const response = await api.post<User>('/api/User', data);
    return response.data;
  },

  /**
   * GET /api/User
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/User');
    return response.data;
  },

  /**
   * GET /api/User/{id}
   * Get a user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/api/User/${id}`);
    return response.data;
  },

  /**
   * PUT /api/User
   * Update current user
   */
  update: async (data: UpdateUserDTO): Promise<User> => {
    const response = await api.put<User>('/api/User', data);
    return response.data;
  },

  /**
   * DELETE /api/User
   * Delete current user
   */
  delete: async (): Promise<void> => {
    await api.delete('/api/User');
  },
};

export default userApi;
