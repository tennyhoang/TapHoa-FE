import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addressService } from '../address.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('addressService', () => {
  it('getAll returns addresses', async () => {
    const addresses = [{ id: 'a1', street: '123 Main' }];
    mockApi.get.mockResolvedValue({ data: addresses });
    const result = await addressService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/addresses');
    expect(result).toEqual(addresses);
  });

  it('add posts address data', async () => {
    const data = { street: '456 Oak' } as any;
    mockApi.post.mockResolvedValue({ data: { id: 'a2', ...data } });
    const result = await addressService.add(data);
    expect(mockApi.post).toHaveBeenCalledWith('/addresses', data);
    expect(result).toEqual({ id: 'a2', ...data });
  });

  it('setDefault patches default endpoint', async () => {
    const address = { id: 'a1', street: '123 Main', isDefault: true };
    mockApi.patch.mockResolvedValue({ data: address });
    const result = await addressService.setDefault('a1');
    expect(mockApi.patch).toHaveBeenCalledWith('/addresses/a1/default');
    expect(result).toEqual(address);
  });

  it('remove calls delete', async () => {
    mockApi.delete.mockResolvedValue({});
    await addressService.remove('a1');
    expect(mockApi.delete).toHaveBeenCalledWith('/addresses/a1');
  });
});
