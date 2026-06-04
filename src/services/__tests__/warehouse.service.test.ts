import { describe, it, expect, vi, beforeEach } from 'vitest';
import { warehouseService } from '../warehouse.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('warehouseService', () => {
  it('getActive returns warehouses', async () => {
    const warehouses = [{ id: 'w1', name: 'Main' }];
    mockApi.get.mockResolvedValue({ data: warehouses });
    const result = await warehouseService.getActive();
    expect(mockApi.get).toHaveBeenCalledWith('/warehouses');
    expect(result).toEqual(warehouses);
  });

  describe('admin', () => {
    it('getAll returns all warehouses', async () => {
      const warehouses = [{ id: 'w1', name: 'Main' }];
      mockApi.get.mockResolvedValue({ data: warehouses });
      const result = await warehouseService.admin.getAll();
      expect(mockApi.get).toHaveBeenCalledWith('/admin/warehouses');
      expect(result).toEqual(warehouses);
    });

    it('create returns { id }', async () => {
      const payload = { name: 'New', address: 'Addr', ward: 'W', district: 'D', province: 'P' };
      mockApi.post.mockResolvedValue({ data: { id: 'w2' } });
      const result = await warehouseService.admin.create(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/admin/warehouses', payload);
      expect(result).toEqual({ id: 'w2' });
    });

    it('update returns { id }', async () => {
      const payload = { name: 'Updated', address: 'Addr', ward: 'W', district: 'D', province: 'P' };
      mockApi.put.mockResolvedValue({ data: { id: 'w1' } });
      const result = await warehouseService.admin.update('w1', payload);
      expect(mockApi.put).toHaveBeenCalledWith('/admin/warehouses/w1', payload);
      expect(result).toEqual({ id: 'w1' });
    });

    it('toggle returns { isActive }', async () => {
      mockApi.patch.mockResolvedValue({ data: { isActive: false } });
      const result = await warehouseService.admin.toggle('w1');
      expect(mockApi.patch).toHaveBeenCalledWith('/admin/warehouses/w1/toggle');
      expect(result).toEqual({ isActive: false });
    });

    it('delete calls delete', async () => {
      mockApi.delete.mockResolvedValue({});
      await warehouseService.admin.delete('w1');
      expect(mockApi.delete).toHaveBeenCalledWith('/admin/warehouses/w1');
    });
  });
});
