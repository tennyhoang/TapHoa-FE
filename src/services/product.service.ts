import api from '@/lib/api';
import { PagedResult, Product, Review } from '@/types';

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  thumbnailUrl?: string;
  images: string[];
  categoryId: string;
}

export const productService = {
  getAll: (params?: { search?: string; categoryId?: string; minPrice?: number; maxPrice?: number; sortBy?: string; page?: number; pageSize?: number; hubId?: string; isNew?: boolean; isDiscount?: boolean }) =>
    api.get<PagedResult<Product>>('/products', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`).then(r => r.data),

  getReviews: (productId: string) =>
    api.get<Review[]>(`/products/${productId}/reviews`).then(r => r.data),

  addReview: (productId: string, rating: number, comment?: string) =>
    api.post<Review>(`/products/${productId}/reviews`, { rating, comment }).then(r => r.data),

  create: (data: ProductPayload) =>
    api.post<Product>('/products', data).then(r => r.data),

  update: (id: string, data: ProductPayload) =>
    api.put<Product>(`/products/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),
};
