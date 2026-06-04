import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../user.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('userService', () => {
  it('getAll uses default params', async () => {
    const paged = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    mockApi.get.mockResolvedValue({ data: paged });
    const result = await userService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/users', { params: { page: 1, pageSize: 20 } });
    expect(result).toEqual(paged);
  });

  it('getAll merges custom params', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [], totalCount: 0 } });
    await userService.getAll({ page: 2, pageSize: 10, search: 'test', role: 'Admin' });
    expect(mockApi.get).toHaveBeenCalledWith('/users', {
      params: { page: 2, pageSize: 10, search: 'test', role: 'Admin' },
    });
  });

  it('update puts user data', async () => {
    const payload = { fullName: 'New Name' };
    mockApi.put.mockResolvedValue({ data: { id: 'u1', ...payload } });
    const result = await userService.update('u1', payload);
    expect(mockApi.put).toHaveBeenCalledWith('/users/u1', payload);
    expect(result).toEqual({ id: 'u1', fullName: 'New Name' });
  });

  it('delete calls delete and unwraps data', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await userService.delete('u1');
    expect(mockApi.delete).toHaveBeenCalledWith('/users/u1');
    expect(result).toEqual({ success: true });
  });

  it('assignWarehouse patches assign endpoint', async () => {
    mockApi.patch.mockResolvedValue({ data: null });
    await userService.assignWarehouse('u1', 'w1', 'Driver');
    expect(mockApi.patch).toHaveBeenCalledWith('/admin/users/u1/assign-warehouse', {
      warehouseId: 'w1',
      targetType: 'Driver',
    });
  });

  it('assignWarehouse accepts null warehouseId', async () => {
    mockApi.patch.mockResolvedValue({ data: null });
    await userService.assignWarehouse('u1', null, 'Manager');
    expect(mockApi.patch).toHaveBeenCalledWith('/admin/users/u1/assign-warehouse', {
      warehouseId: null,
      targetType: 'Manager',
    });
  });
});
