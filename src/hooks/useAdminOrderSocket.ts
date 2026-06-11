'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const HUB_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5084/api/v1').replace(/\/api\/v\d+$/, '') +
  '/hubs/order-tracking';

export function useAdminOrderSocket() {
  const queryClient = useQueryClient();
  const { token, isAuthenticated, isAdmin } = useAuthStore();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin() || !token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('AdminOrderStatusChanged', (payload: { orderId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', payload.orderId] });
      toast.info(
        `Đơn hàng cập nhật: ${payload.orderId.slice(0, 8).toUpperCase()} → ${payload.status}`,
        {
          duration: 4000,
        }
      );
    });

    connectionRef.current = connection;
    connection.start().catch(() => {});

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
}
