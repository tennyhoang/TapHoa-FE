import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from '../order.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

const order = { id: 'o1', code: 'ORD-001' };

describe('orderService', () => {
  it('getMyOrders uses default params', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    const result = await orderService.getMyOrders();
    expect(mockApi.get).toHaveBeenCalledWith('/orders/my', { params: { page: 1, pageSize: 10 } });
    expect(result.items).toEqual([order]);
  });

  it('getMyOrders merges custom params', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    await orderService.getMyOrders({ page: 2, pageSize: 5 });
    expect(mockApi.get).toHaveBeenCalledWith('/orders/my', { params: { page: 2, pageSize: 5 } });
  });

  it('getAllOrders returns all orders', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    const result = await orderService.getAllOrders();
    expect(mockApi.get).toHaveBeenCalledWith('/orders/all', { params: { page: 1, pageSize: 10 } });
    expect(result.items).toEqual([order]);
  });

  it('getById fetches single order', async () => {
    mockApi.get.mockResolvedValue({ data: order });
    const result = await orderService.getById('o1');
    expect(mockApi.get).toHaveBeenCalledWith('/orders/o1');
    expect(result).toEqual(order);
  });

  it('create posts order data', async () => {
    const data = {
      hubId: 'h1',
      receiverName: 'Name',
      phoneNumber: '0123',
      paymentMethod: 'COD' as const,
    };
    mockApi.post.mockResolvedValue({ data: order });
    const result = await orderService.create(data);
    expect(mockApi.post).toHaveBeenCalledWith('/orders', data);
    expect(result).toEqual(order);
  });

  it('cancelOrder patches cancel endpoint', async () => {
    mockApi.patch.mockResolvedValue({ data: order });
    const result = await orderService.cancelOrder('o1');
    expect(mockApi.patch).toHaveBeenCalledWith('/orders/o1/cancel');
    expect(result).toEqual(order);
  });

  it('updateOrderStatus patches status', async () => {
    mockApi.patch.mockResolvedValue({ data: order });
    const result = await orderService.updateOrderStatus('o1', 'Shipping');
    expect(mockApi.patch).toHaveBeenCalledWith('/orders/o1/status', { status: 'Shipping' });
    expect(result).toEqual(order);
  });

  it('driverPickup patches pickup endpoint', async () => {
    mockApi.patch.mockResolvedValue({ data: null });
    await orderService.driverPickup(['o1', 'o2']);
    expect(mockApi.patch).toHaveBeenCalledWith('/driver/orders/pickup-from-warehouse', {
      orderIds: ['o1', 'o2'],
    });
  });

  it('agentArrive patches arrive endpoint', async () => {
    mockApi.patch.mockResolvedValue({ data: order });
    const result = await orderService.agentArrive('o1');
    expect(mockApi.patch).toHaveBeenCalledWith('/agent/orders/o1/arrive');
    expect(result).toEqual(order);
  });

  it('agentCompletePickup patches complete-pickup endpoint', async () => {
    mockApi.patch.mockResolvedValue({ data: order });
    const result = await orderService.agentCompletePickup('o1');
    expect(mockApi.patch).toHaveBeenCalledWith('/agent/orders/o1/complete-pickup');
    expect(result).toEqual(order);
  });

  it('getAgentOrders uses default params', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    const result = await orderService.getAgentOrders();
    expect(mockApi.get).toHaveBeenCalledWith('/agent/orders', {
      params: { page: 1, pageSize: 20 },
    });
    expect(result.items).toEqual([order]);
  });

  it('getAgentOrders accepts custom params', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    await orderService.getAgentOrders({ status: 'Shipping', page: 2, pageSize: 10 });
    expect(mockApi.get).toHaveBeenCalledWith('/agent/orders', {
      params: { status: 'Shipping', page: 2, pageSize: 10 },
    });
  });

  it('getDriverOrders returns hub batches', async () => {
    const batches = [{ hubId: 'h1', orders: [order] }];
    mockApi.get.mockResolvedValue({ data: batches });
    const result = await orderService.getDriverOrders();
    expect(mockApi.get).toHaveBeenCalledWith('/driver/orders');
    expect(result).toEqual(batches);
  });

  it('getDriverShippingOrders returns shipping orders', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    const result = await orderService.getDriverShippingOrders();
    expect(mockApi.get).toHaveBeenCalledWith('/driver/orders/shipping', {
      params: { pageSize: 50 },
    });
    expect(result.items).toEqual([order]);
  });

  it('getDriverCompletedOrders returns delivered orders', async () => {
    mockApi.get.mockResolvedValue({ data: { items: [order], totalCount: 1 } });
    const result = await orderService.getDriverCompletedOrders();
    expect(mockApi.get).toHaveBeenCalledWith('/driver/orders/delivered', {
      params: { pageSize: 30 },
    });
    expect(result.items).toEqual([order]);
  });
});
