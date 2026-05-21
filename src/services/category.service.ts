import api from '@/lib/api';
import { Category } from '@/types';

export interface CategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories').then(r => r.data),

  create: (data: CategoryPayload) =>
    api.post<Category>('/categories', data).then(r => r.data),

  update: (id: string, data: CategoryPayload) =>
    api.put<Category>(`/categories/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};
