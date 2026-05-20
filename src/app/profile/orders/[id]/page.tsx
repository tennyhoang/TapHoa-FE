'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
    enabled: mounted && isAuthenticated(),
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: () => toast.error('Không thể hủy đơn hàng này'),
  });

  if (!mounted) return null;

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>;
  }

  if (!order) return <div className="text-center py-20 text-gray-400">Không tìm thấy đơn hàng</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Đơn #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Địa chỉ giao hàng</h2>
        <p className="text-sm font-medium">{order.receiverName} — {order.phoneNumber}</p>
        <p className="text-sm text-gray-500">{order.shippingAddress}</p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <h2 className="font-semibold">Sản phẩm</h2>
        {order.items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex gap-3 items-center">
            <div className="relative w-14 h-14 bg-gray-50 rounded-md overflow-hidden shrink-0">
              {item.thumbnailUrl ? (
                <Image src={item.thumbnailUrl} alt={item.productName} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
              <p className="text-xs text-gray-500">x{item.quantity} × {formatPrice(item.unitPrice)}</p>
            </div>
            <p className="text-sm font-bold shrink-0">{formatPrice(item.subtotal)}</p>
          </div>
        ))}
      </div>

      <Separator />

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <div className="flex justify-between font-bold text-lg">
          <span>Tổng cộng</span>
          <span className="text-emerald-600">{formatPrice(order.totalAmount)}</span>
        </div>
        {order.note && <p className="text-sm text-gray-500">Ghi chú: {order.note}</p>}
      </div>

      {order.status === OrderStatus.Pending && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => { if (confirm('Xác nhận hủy đơn hàng?')) cancelMutation.mutate(); }}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
        </Button>
      )}
    </div>
  );
}
