import api from './api';
import type {
  CreateCollectionDTO,
  UpdateCollectionDTO,
  PromptCollection,
} from '../types/api';

export const collectionApi = {
  /**
   * POST /api/PromptCollection
   * Create a new collection
   */
  create: async (data: CreateCollectionDTO): Promise<PromptCollection> => {
    const response = await api.post<PromptCollection>('/api/PromptCollection', data);
    return response.data;
  },

  /**
   * GET /api/PromptCollection/{id}
   * Get a collection by ID
   */
  getById: async (id: string): Promise<PromptCollection> => {
    const response = await api.get<PromptCollection>(`/api/PromptCollection/${id}`);
    return response.data;
  },

  /**
   * PUT /api/PromptCollection/{id}
   * Update a collection by ID
   */
  update: async (id: string, data: UpdateCollectionDTO): Promise<PromptCollection> => {
    const response = await api.put<PromptCollection>(`/api/PromptCollection/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/PromptCollection/{id}
   * Delete a collection by ID
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/PromptCollection/${id}`);
  },

  /**
   * GET /api/PromptCollection/me
   * Get all collections for the current user
   */
  getMyCollections: async (): Promise<PromptCollection[]> => {
    const response = await api.get<PromptCollection[]>('/api/PromptCollection/me');
    return response.data;
  },
};

export default collectionApi;
