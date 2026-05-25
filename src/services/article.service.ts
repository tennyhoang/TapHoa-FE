import api from '@/lib/api';

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
}

export const articleService = {
  generate: (topic: string, category: string) =>
    api.post<GeneratedArticle>('/admin/articles/generate', { topic, category }).then(r => r.data),
};
