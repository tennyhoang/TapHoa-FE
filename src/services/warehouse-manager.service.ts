import api from '@/lib/api';
import {
  WarehouseDashboard,
  WarehouseOrder,
  WarehouseInventoryItem,
  WarehouseDriver,
  PagedResult,
} from '@/types';

export const warehouseManagerService = {
  getDashboard: (): Promise<WarehouseDashboard> =>
    api.get<WarehouseDashboard>('/warehouse-manager/dashboard').then(r => r.data),

  getOrders: (
    params: {
      status?: 'pending' | 'packed' | 'shipping';
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PagedResult<WarehouseOrder>> =>
    api
      .get<PagedResult<WarehouseOrder>>('/warehouse-manager/orders', {
        params: { page: 1, pageSize: 20, ...params },
      })
      .then(r => r.data),

  packOrder: (id: string): Promise<{ id: string; status: string }> =>
    api
      .patch<{ id: string; status: string }>(`/warehouse-manager/orders/${id}/pack`)
      .then(r => r.data),

  packBatch: (orderIds: string[]): Promise<{ packed: number; errors: string[] }> =>
    api
      .patch<{
        packed: number;
        errors: string[];
      }>('/warehouse-manager/orders/pack-batch', { orderIds })
      .then(r => r.data),

  getInventory: (
    params: {
      search?: string;
      filter?: 'low' | 'out' | '';
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PagedResult<WarehouseInventoryItem>> =>
    api
      .get<PagedResult<WarehouseInventoryItem>>('/warehouse-manager/inventory', { params })
      .then(r => r.data),

  adjustStock: (
    productId: string,
    delta: number,
    reason?: string
  ): Promise<{ id: string; name: string; stock: number }> =>
    api
      .patch<{
        id: string;
        name: string;
        stock: number;
      }>(`/warehouse-manager/inventory/${productId}/adjust`, { delta, reason })
      .then(r => r.data),

  getDrivers: (): Promise<WarehouseDriver[]> =>
    api.get<WarehouseDriver[]>('/warehouse-manager/drivers').then(r => r.data),
};
