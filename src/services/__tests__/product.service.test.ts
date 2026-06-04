import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../product.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('productService', () => {
  it('getAll passes params', async () => {
    const paged = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    mockApi.get.mockResolvedValue({ data: paged });
    const params = { categoryId: 'c1', page: 1, pageSize: 20 };
    const result = await productService.getAll(params);
    expect(mockApi.get).toHaveBeenCalledWith('/products', { params });
    expect(result).toEqual(paged);
  });

  it('getAll works without params', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [], totalCount: 0 } });
    await productService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/products', { params: undefined });
  });

  it('getById returns product', async () => {
    const product = { id: 'p1', name: 'Product' };
    mockApi.get.mockResolvedValue({ data: product });
    const result = await productService.getById('p1');
    expect(mockApi.get).toHaveBeenCalledWith('/products/p1');
    expect(result).toEqual(product);
  });

  it('getReviews returns reviews', async () => {
    const reviews = [{ id: 'r1', rating: 5, comment: 'Great' }];
    mockApi.get.mockResolvedValue({ data: reviews });
    const result = await productService.getReviews('p1');
    expect(mockApi.get).toHaveBeenCalledWith('/products/p1/reviews');
    expect(result).toEqual(reviews);
  });

  it('addReview posts review with comment', async () => {
    const review = { id: 'r1', rating: 5, comment: 'Great' };
    mockApi.post.mockResolvedValue({ data: review });
    const result = await productService.addReview('p1', 5, 'Great');
    expect(mockApi.post).toHaveBeenCalledWith('/products/p1/reviews', {
      rating: 5,
      comment: 'Great',
    });
    expect(result).toEqual(review);
  });

  it('addReview posts review without comment', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 'r1', rating: 4 } });
    await productService.addReview('p1', 4);
    expect(mockApi.post).toHaveBeenCalledWith('/products/p1/reviews', {
      rating: 4,
      comment: undefined,
    });
  });

  it('create posts product data', async () => {
    const data = { name: 'New', price: 100, stock: 10, images: [], categoryId: 'c1' };
    mockApi.post.mockResolvedValue({ data: { id: 'p1' } });
    const result = await productService.create(data);
    expect(mockApi.post).toHaveBeenCalledWith('/products', data);
    expect(result).toEqual({ id: 'p1' });
  });

  it('update puts product data', async () => {
    const data = { name: 'Updated', price: 150, stock: 5, images: [], categoryId: 'c1' };
    mockApi.put.mockResolvedValue({ data: { id: 'p1' } });
    const result = await productService.update('p1', data);
    expect(mockApi.put).toHaveBeenCalledWith('/products/p1', data);
    expect(result).toEqual({ id: 'p1' });
  });

  it('delete calls delete', async () => {
    mockApi.delete.mockResolvedValue({});
    await productService.delete('p1');
    expect(mockApi.delete).toHaveBeenCalledWith('/products/p1');
  });
});
