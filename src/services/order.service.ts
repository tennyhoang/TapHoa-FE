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

  // Driver: confirm pickup from warehouse (Confirmed → Shipping)
  driverPickup: (orderIds: string[]) =>
    api.patch('/driver/orders/pickup-from-warehouse', { orderIds }).then(r => r.data),

  // Agent: confirm order arrived at hub (Shipping → ArrivedAtHub)
  agentArrive: (orderId: string) =>
    api.patch<Order>(`/agent/orders/${orderId}/arrive`).then(r => r.data),

  // Agent: confirm customer picked up (ArrivedAtHub → Delivered)
  agentCompletePickup: (orderId: string) =>
    api.patch<Order>(`/agent/orders/${orderId}/complete-pickup`).then(r => r.data),

  // Agent: get orders for agent's hub
  getAgentOrders: (params: { status?: OrderStatus; page?: number; pageSize?: number } = {}) =>
    api.get<PagedResult<Order>>('/agent/orders', { params: { page: 1, pageSize: 20, ...params } }).then(r => r.data),

  // Driver: get Confirmed orders to pick up
  getDriverOrders: (params: { page?: number; pageSize?: number } = {}) =>
    api.get<PagedResult<Order>>('/driver/orders', { params: { page: 1, pageSize: 20, ...params } }).then(r => r.data),
};
