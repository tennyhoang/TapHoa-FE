import api from '@/lib/api';
import { Order, OrderFilterParams, OrderStatus, PagedResult, UpdateOrderStatusRequest } from '@/types';

export interface CreateOrderRequest {
  hubId: string;
  receiverName: string;
  phoneNumber: string;
  note?: string;
  paymentMethod: 'COD' | 'BankTransfer';
}

export const orderService = {
  getMyOrders: (params: OrderFilterParams = {}) =>
    api.get<PagedResult<Order>>('/orders/my', { params: { page: 1, pageSize: 10, ...params } }).then(r => r.data),

  getAllOrders: (params: OrderFilterParams = {}) =>
    api.get<PagedResult<Order>>('/orders/all', { params: { page: 1, pageSize: 10, ...params } }).then(r => r.data),

  getById: (id: string) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),

  create: (data: CreateOrderRequest) =>
    api.post<Order>('/orders', data).then(r => r.data),

  cancelOrder: (id: string) =>
    api.patch<Order>(`/orders/${id}/cancel`).then(r => r.data),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status } satisfies UpdateOrderStatusRequest).then(r => r.data),
};
