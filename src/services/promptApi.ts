import api from './api';
import type { CreatePromptDTO, UpdatePromptDTO, Prompt } from '../types/api';

export const promptApi = {
  /**
   * POST /api/Prompt
   * Create a new prompt
   */
  create: async (data: CreatePromptDTO): Promise<Prompt> => {
    const response = await api.post<Prompt>('/api/Prompt', data);
    return response.data;
  },

  /**
   * GET /api/Prompt/{id}
   * Get a prompt by ID
   */
  getById: async (id: string): Promise<Prompt> => {
    const response = await api.get<Prompt>(`/api/Prompt/${id}`);
    return response.data;
  },

  /**
   * PUT /api/Prompt/{id}
   * Update a prompt by ID
   */
  update: async (id: string, data: UpdatePromptDTO): Promise<Prompt> => {
    const response = await api.put<Prompt>(`/api/Prompt/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/Prompt/{id}
   * Delete a prompt by ID
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/Prompt/${id}`);
  },

  /**
   * GET /api/Prompt/me
   * Get all prompts for the current user
   */
  getMyPrompts: async (): Promise<Prompt[]> => {
    const response = await api.get<Prompt[]>('/api/Prompt/me');
    return response.data;
  },
};

export default promptApi;
