import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from '../cart.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('cartService', () => {
  const cartData = { items: [], totalAmount: 0, totalItems: 0 };

  it('get fetches cart', async () => {
    mockApi.get.mockResolvedValue({ data: cartData });
    const result = await cartService.get();
    expect(mockApi.get).toHaveBeenCalledWith('/cart');
    expect(result).toEqual(cartData);
  });

  it('add posts product and quantity', async () => {
    mockApi.post.mockResolvedValue({ data: cartData });
    await cartService.add('p1', 2);
    expect(mockApi.post).toHaveBeenCalledWith('/cart', { productId: 'p1', quantity: 2 });
  });

  it('update puts quantity for product', async () => {
    mockApi.put.mockResolvedValue({ data: cartData });
    await cartService.update('p1', 3);
    expect(mockApi.put).toHaveBeenCalledWith('/cart/p1', { quantity: 3 });
  });

  it('remove deletes product from cart', async () => {
    mockApi.delete.mockResolvedValue({ data: cartData });
    await cartService.remove('p1');
    expect(mockApi.delete).toHaveBeenCalledWith('/cart/p1');
  });

  it('clear deletes entire cart', async () => {
    mockApi.delete.mockResolvedValue({});
    await cartService.clear();
    expect(mockApi.delete).toHaveBeenCalledWith('/cart');
  });
});
