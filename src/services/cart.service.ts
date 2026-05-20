import api from '@/lib/api';
import { Cart } from '@/types';

export const cartService = {
  get: () => api.get<Cart>('/cart').then(r => r.data),
  add: (productId: string, quantity: number) =>
    api.post<Cart>('/cart', { productId, quantity }).then(r => r.data),
  update: (productId: string, quantity: number) =>
    api.put<Cart>(`/cart/${productId}`, { quantity }).then(r => r.data),
  remove: (productId: string) =>
    api.delete<Cart>(`/cart/${productId}`).then(r => r.data),
  clear: () => api.delete('/cart'),
};
