'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const HUB_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5084/api/v1').replace(/\/api\/v\d+$/, '') +
  '/hubs/order-tracking';

const STATUS_MESSAGES: Record<string, string> = {
  ShippingToHub: 'Đơn hàng đang được vận chuyển đến Hub.',
  InHub_ReadyForPickup: 'Hàng đã đến Hub, bạn có thể đến lấy!',
  Completed: 'Đơn hàng hoàn thành. Cảm ơn bạn đã mua sắm!',
  Cancelled: 'Đơn hàng của bạn đã bị hủy.',
};

export function useOrderStatusSocket() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('OrderStatusChanged', (payload: { orderId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['order', payload.orderId] });

      const msg = STATUS_MESSAGES[payload.status];
      if (msg) toast.info(msg, { duration: 5000 });
    });

    connectionRef.current = connection;
    connection.start().catch(() => {});

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
}
