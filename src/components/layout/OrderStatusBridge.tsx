'use client';

import { useOrderStatusSocket } from '@/hooks/useOrderStatusSocket';

export function OrderStatusBridge() {
  useOrderStatusSocket();
  return null;
}
