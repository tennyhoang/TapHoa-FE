import api from '@/lib/api';

export interface FlashSaleProduct {
  id: string;
  name: string;
  thumbnailUrl?: string;
  categoryName: string;
  originalPrice: number;
  flashSalePrice: number;
  flashSaleStock: number;
  soldCount: number;
  stockRemaining: number;
}

export interface FlashSaleSession {
  sessionId: string;
  name: string;
  startTime: string;
  endTime: string;
  products: FlashSaleProduct[];
}

export interface CreateSessionPayload {
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AddItemPayload {
  productId: string;
  flashSalePrice: number;
  flashSaleStock: number;
}

export interface BulkAddItemPayload {
  productId: string;
  flashSalePrice: number;
  flashSaleStock: number;
}

export interface AdminSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  itemCount: number;
}

export interface AdminSessionItem {
  id: string;
  productId: string;
  productName: string;
  thumbnailUrl?: string;
  originalPrice: number;
  flashSalePrice: number;
  flashSaleStock: number;
  soldCount: number;
}

export const flashSaleService = {
  getCurrent: (): Promise<FlashSaleSession | null> =>
    api.get<FlashSaleSession | null>('/flash-sale/current').then(r => r.data ?? null),

  admin: {
    getSessions: (): Promise<AdminSession[]> =>
      api.get<AdminSession[]>('/admin/flash-sale').then(r => r.data),

    createSession: (payload: CreateSessionPayload): Promise<{ id: string }> =>
      api.post<{ id: string }>('/admin/flash-sale', payload).then(r => r.data),

    toggleSession: (id: string): Promise<{ isActive: boolean }> =>
      api.patch<{ isActive: boolean }>(`/admin/flash-sale/${id}/toggle`).then(r => r.data),

    deleteSession: (id: string): Promise<void> =>
      api.delete(`/admin/flash-sale/${id}`).then(() => undefined),

    getItems: (sessionId: string): Promise<AdminSessionItem[]> =>
      api.get<AdminSessionItem[]>(`/admin/flash-sale/${sessionId}/items`).then(r => r.data),

    addItem: (sessionId: string, payload: AddItemPayload): Promise<{ id: string }> =>
      api.post<{ id: string }>(`/admin/flash-sale/${sessionId}/items`, payload).then(r => r.data),

    removeItem: (sessionId: string, itemId: string): Promise<void> =>
      api.delete(`/admin/flash-sale/${sessionId}/items/${itemId}`).then(() => undefined),

    addItemsBulk: (sessionId: string, items: BulkAddItemPayload[]): Promise<{ added: number; skipped: number }> =>
      api.post<{ added: number; skipped: number }>(`/admin/flash-sale/${sessionId}/items/bulk`, { items }).then(r => r.data),
  },
};
