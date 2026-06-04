import { describe, it, expect, vi, beforeEach } from 'vitest';
import { driverService } from '../driver.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('driverService', () => {
  it('getMyWarehouse returns assigned warehouse', async () => {
    const warehouse = { id: 'w1', name: 'Main', fullAddress: 'Addr', phoneNumber: '0123' };
    mockApi.get.mockResolvedValue({ data: warehouse });
    const result = await driverService.getMyWarehouse();
    expect(mockApi.get).toHaveBeenCalledWith('/driver/me/warehouse');
    expect(result).toEqual(warehouse);
  });

  it('optimizeRoute posts order addresses', async () => {
    const response = { stops: [], isOptimized: true, hubLng: null, hubLat: null };
    mockApi.post.mockResolvedValue({ data: response });
    const result = await driverService.optimizeRoute(['Addr 1', 'Addr 2']);
    expect(mockApi.post).toHaveBeenCalledWith('/driver/optimize-route', {
      orderAddresses: ['Addr 1', 'Addr 2'],
    });
    expect(result).toEqual(response);
  });
});
