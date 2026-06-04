import { describe, it, expect, vi, beforeEach } from 'vitest';
import { articleService } from '../article.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('articleService', () => {
  it('generate posts topic and category', async () => {
    const generated = { title: 'Title', excerpt: 'Excerpt', content: 'Content' };
    mockApi.post.mockResolvedValue({ data: generated });
    const result = await articleService.generate('AI', 'Tech');
    expect(mockApi.post).toHaveBeenCalledWith('/admin/articles/generate', {
      topic: 'AI',
      category: 'Tech',
    });
    expect(result).toEqual(generated);
  });

  it('getAll returns articles', async () => {
    const articles = [{ id: 'a1', title: 'Article 1' }];
    mockApi.get.mockResolvedValue({ data: articles });
    const result = await articleService.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/articles');
    expect(result).toEqual(articles);
  });

  it('publish posts article payload', async () => {
    const payload = { title: 'New', excerpt: 'Exc', content: 'Cnt', category: 'Tech' };
    mockApi.post.mockResolvedValue({ data: { id: 'a1' } });
    const result = await articleService.publish(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/admin/articles', payload);
    expect(result).toEqual({ id: 'a1' });
  });

  it('delete calls delete', async () => {
    mockApi.delete.mockResolvedValue({});
    await articleService.delete('a1');
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/articles/a1');
  });
});
