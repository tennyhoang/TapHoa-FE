import api from '@/lib/api';
import { AdminUser, PagedResult } from '@/types';

export interface AdminUserFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
  agentHubId?: string | null;
}

export const userService = {
  getAll: (params: AdminUserFilterParams = {}) =>
    api.get<PagedResult<AdminUser>>('/users', { params: { page: 1, pageSize: 20, ...params } }).then(r => r.data),

  update: (id: string, payload: UpdateUserPayload) =>
    api.put<AdminUser>(`/users/${id}`, payload).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/users/${id}`).then(r => r.data),
};
