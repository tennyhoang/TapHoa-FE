import api from '@/lib/api';

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  readTimeMinutes: number;
  createdAt: string;
}

export interface SaveArticlePayload {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  readTimeMinutes?: number;
}

export const articleService = {
  generate: (topic: string, category: string) =>
    api.post<GeneratedArticle>('/admin/articles/generate', { topic, category }).then(r => r.data),

  getAll: () =>
    api.get<Article[]>('/articles').then(r => r.data),

  publish: (payload: SaveArticlePayload) =>
    api.post<{ id: string }>('/admin/articles', payload).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/admin/articles/${id}`),
};
