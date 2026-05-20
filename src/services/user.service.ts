import api from '@/lib/api';
import { PagedResult } from '@/types';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}

export const userService = {
  getAll: (params: AdminUserFilterParams = {}) =>
    api.get<PagedResult<AdminUser>>('/users', { params: { page: 1, pageSize: 20, ...params } }).then(r => r.data),
};
