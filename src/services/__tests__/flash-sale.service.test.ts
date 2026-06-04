import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flashSaleService } from '../flash-sale.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('flashSaleService', () => {
  it('getCurrent returns session when data exists', async () => {
    const session = { sessionId: 's1', name: 'Flash', startTime: '', endTime: '', products: [] };
    mockApi.get.mockResolvedValue({ data: session });
    const result = await flashSaleService.getCurrent();
    expect(mockApi.get).toHaveBeenCalledWith('/flash-sale/current');
    expect(result).toEqual(session);
  });

  it('getCurrent returns null when data is null', async () => {
    mockApi.get.mockResolvedValue({ data: null });
    const result = await flashSaleService.getCurrent();
    expect(result).toBeNull();
  });

  describe('admin', () => {
    it('getSessions returns sessions', async () => {
      const sessions = [
        {
          id: 's1',
          name: 'S1',
          startTime: '',
          endTime: '',
          isActive: true,
          createdAt: '',
          itemCount: 0,
        },
      ];
      mockApi.get.mockResolvedValue({ data: sessions });
      const result = await flashSaleService.admin.getSessions();
      expect(mockApi.get).toHaveBeenCalledWith('/admin/flash-sale');
      expect(result).toEqual(sessions);
    });

    it('createSession returns { id }', async () => {
      const payload = {
        name: 'New',
        startTime: '2024-01-01',
        endTime: '2024-01-02',
        isActive: true,
      };
      mockApi.post.mockResolvedValue({ data: { id: 's1' } });
      const result = await flashSaleService.admin.createSession(payload);
      expect(mockApi.post).toHaveBeenCalledWith('/admin/flash-sale', payload);
      expect(result).toEqual({ id: 's1' });
    });

    it('toggleSession returns { isActive }', async () => {
      mockApi.patch.mockResolvedValue({ data: { isActive: false } });
      const result = await flashSaleService.admin.toggleSession('s1');
      expect(mockApi.patch).toHaveBeenCalledWith('/admin/flash-sale/s1/toggle');
      expect(result).toEqual({ isActive: false });
    });

    it('deleteSession calls delete', async () => {
      mockApi.delete.mockResolvedValue({});
      await flashSaleService.admin.deleteSession('s1');
      expect(mockApi.delete).toHaveBeenCalledWith('/admin/flash-sale/s1');
    });

    it('getItems returns items for session', async () => {
      const items = [
        {
          id: 'i1',
          productId: 'p1',
          productName: 'P1',
          originalPrice: 100,
          flashSalePrice: 80,
          flashSaleStock: 10,
          soldCount: 0,
        },
      ];
      mockApi.get.mockResolvedValue({ data: items });
      const result = await flashSaleService.admin.getItems('s1');
      expect(mockApi.get).toHaveBeenCalledWith('/admin/flash-sale/s1/items');
      expect(result).toEqual(items);
    });

    it('addItem returns { id }', async () => {
      const payload = { productId: 'p1', flashSalePrice: 80, flashSaleStock: 10 };
      mockApi.post.mockResolvedValue({ data: { id: 'i1' } });
      const result = await flashSaleService.admin.addItem('s1', payload);
      expect(mockApi.post).toHaveBeenCalledWith('/admin/flash-sale/s1/items', payload);
      expect(result).toEqual({ id: 'i1' });
    });

    it('removeItem calls delete', async () => {
      mockApi.delete.mockResolvedValue({});
      await flashSaleService.admin.removeItem('s1', 'i1');
      expect(mockApi.delete).toHaveBeenCalledWith('/admin/flash-sale/s1/items/i1');
    });

    it('addItemsBulk returns added and skipped counts', async () => {
      const items = [{ productId: 'p1', flashSalePrice: 80, flashSaleStock: 10 }];
      mockApi.post.mockResolvedValue({ data: { added: 1, skipped: 0 } });
      const result = await flashSaleService.admin.addItemsBulk('s1', items);
      expect(mockApi.post).toHaveBeenCalledWith('/admin/flash-sale/s1/items/bulk', { items });
      expect(result).toEqual({ added: 1, skipped: 0 });
    });
  });
});
