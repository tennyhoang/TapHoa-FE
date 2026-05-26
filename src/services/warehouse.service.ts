import api from '@/lib/api';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface WarehousePayload {
  name: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  phoneNumber?: string;
}

export const warehouseService = {
  getActive: (): Promise<Warehouse[]> =>
    api.get<Warehouse[]>('/warehouses').then(r => r.data),

  admin: {
    getAll: (): Promise<Warehouse[]> =>
      api.get<Warehouse[]>('/admin/warehouses').then(r => r.data),

    create: (payload: WarehousePayload): Promise<{ id: string }> =>
      api.post<{ id: string }>('/admin/warehouses', payload).then(r => r.data),

    update: (id: string, payload: WarehousePayload): Promise<{ id: string }> =>
      api.put<{ id: string }>(`/admin/warehouses/${id}`, payload).then(r => r.data),

    toggle: (id: string): Promise<{ isActive: boolean }> =>
      api.patch<{ isActive: boolean }>(`/admin/warehouses/${id}/toggle`).then(r => r.data),

    delete: (id: string): Promise<void> =>
      api.delete(`/admin/warehouses/${id}`).then(() => undefined),
  },
};
