import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from '../category.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('categoryService', () => {
  it('getAll returns categories', async () => {
    const categories = [{ id: 'c1', name: 'Drinks' }];
    mockApi.get.mockResolvedValue({ data: categories });
    const result = await categoryService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual(categories);
  });

  it('create posts category data', async () => {
    const data = { name: 'Snacks' };
    mockApi.post.mockResolvedValue({ data: { id: 'c2' } });
    const result = await categoryService.create(data);
    expect(mockApi.post).toHaveBeenCalledWith('/categories', data);
    expect(result).toEqual({ id: 'c2' });
  });

  it('update puts category data', async () => {
    const data = { name: 'Updated' };
    mockApi.put.mockResolvedValue({ data: { id: 'c1' } });
    const result = await categoryService.update('c1', data);
    expect(mockApi.put).toHaveBeenCalledWith('/categories/c1', data);
    expect(result).toEqual({ id: 'c1' });
  });

  it('delete calls delete', async () => {
    mockApi.delete.mockResolvedValue({});
    await categoryService.delete('c1');
    expect(mockApi.delete).toHaveBeenCalledWith('/categories/c1');
  });
});
