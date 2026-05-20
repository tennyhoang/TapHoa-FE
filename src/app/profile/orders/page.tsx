'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStatusFilter } from '@/components/orders/OrderStatusFilter';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { toast } from 'sonner';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', statusFilter],
    queryFn: () => orderService.getMyOrders({ status: statusFilter }),
    enabled: mounted && isAuthenticated(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: () => toast.error('Không thể hủy đơn hàng này'),
  });

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>

      <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20 space-y-3">
          <Package className="h-16 w-16 text-gray-300 mx-auto" />
          <p className="text-gray-500">
            {statusFilter ? 'Không có đơn hàng nào với trạng thái này' : 'Bạn chưa có đơn hàng nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={(id) => cancelMutation.mutate(id)}
              cancelling={cancelMutation.isPending && cancelMutation.variables === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
