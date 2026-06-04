import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hubService } from '../hub.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('hubService', () => {
  it('getActive returns hubs with isActive param', async () => {
    const hubs = [{ id: 'h1', name: 'Hub A' }];
    mockApi.get.mockResolvedValue({ data: hubs });
    const result = await hubService.getActive();
    expect(mockApi.get).toHaveBeenCalledWith('/hubs', { params: { isActive: true } });
    expect(result).toEqual(hubs);
  });
});
