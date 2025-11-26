import api from './api';
import type { CreatePromptDTO, UpdatePromptDTO, Prompt } from '../types/api';

export const promptApi = {
  /**
   * POST /api/Prompt
   * Create a new prompt (bookmark)
   */
  create: async (data: CreatePromptDTO): Promise<Prompt> => {
    console.log('📝 [PromptAPI] Creating prompt with payload:', JSON.stringify(data, null, 2));
    console.log('📝 [PromptAPI] collectionId type:', typeof data.collectionId, 'value:', data.collectionId);

    try {
      const response = await api.post<Prompt>('/api/Prompt', data);
      console.log('📝 [PromptAPI] Create success:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('📝 [PromptAPI] Create failed:', error);

      // Extract detailed error message from Axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]>; title?: string }; status?: number } };
        const responseData = axiosError.response?.data;
        const status = axiosError.response?.status;

        console.error('📝 [PromptAPI] Error response:', { status, data: responseData });

        // Try to get a meaningful error message
        if (responseData?.message) {
          throw new Error(responseData.message);
        }
        if (responseData?.title) {
          throw new Error(responseData.title);
        }
        if (responseData?.errors) {
          const errorMessages = Object.values(responseData.errors).flat().join(', ');
          throw new Error(errorMessages || 'Validation failed');
        }
        if (status === 400) {
          throw new Error('Bad Request - Check the payload format');
        }
        if (status === 401) {
          throw new Error('Unauthorized - Please log in again');
        }
      }

      throw error;
    }
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
    console.log('📝 [PromptAPI] Updating prompt:', id, JSON.stringify(data, null, 2));

    try {
      const response = await api.put<Prompt>(`/api/Prompt/${id}`, data);
      console.log('📝 [PromptAPI] Update success:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('📝 [PromptAPI] Update failed:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]>; title?: string }; status?: number } };
        const responseData = axiosError.response?.data;

        if (responseData?.message) {
          throw new Error(responseData.message);
        }
        if (responseData?.title) {
          throw new Error(responseData.title);
        }
        if (responseData?.errors) {
          const errorMessages = Object.values(responseData.errors).flat().join(', ');
          throw new Error(errorMessages || 'Validation failed');
        }
      }

      throw error;
    }
  },

  /**
   * DELETE /api/Prompt/{id}
   * Delete a prompt by ID
   */
  delete: async (id: string): Promise<void> => {
    console.log('📝 [PromptAPI] Deleting prompt:', id);
    await api.delete(`/api/Prompt/${id}`);
    console.log('📝 [PromptAPI] Delete success');
  },

  /**
   * GET /api/Prompt/me
   * Get all prompts for the current user
   */
  getMyPrompts: async (): Promise<Prompt[]> => {
    console.log('📝 [PromptAPI] Fetching my prompts...');
    const response = await api.get<Prompt[]>('/api/Prompt/me');
    console.log('📝 [PromptAPI] Fetched prompts:', response.data.length);
    return response.data;
  },
};

export default promptApi;
