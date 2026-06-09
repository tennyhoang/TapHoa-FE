'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Package, MapPin, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { warehouseManagerService } from '@/services/warehouse-manager.service';
import { formatPrice } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  Paid_WaitingForBatch: 'Chờ đóng gói',
  PackedAtWarehouse: 'Đã đóng gói',
  ShippingToHub: 'Đang vận chuyển',
};

export default function WarehouseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['warehouse-orders', 'pending'],
    queryFn: () => warehouseManagerService.getOrders({ pageSize: 200 }),
  });

  const order = orders?.items.find(o => o.id === id);

  const packMutation = useMutation({
    mutationFn: () => warehouseManagerService.packOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-dashboard'] });
      toast.success('Đã xác nhận đóng gói đơn hàng');
      router.back();
    },
    onError: () => toast.error('Không thể cập nhật trạng thái'),
  });

  if (isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
        <p className="text-sm text-gray-400">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  const isPending = order.status === 'Paid_WaitingForBatch';

  return (
    <div className="max-w-xl space-y-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
      </button>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 font-mono">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            {STATUS_LABEL[order.status]}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer info */}
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{order.customer.fullName}</p>
              {order.customer.phoneNumber && (
                <p className="text-xs text-gray-400 mt-0.5">{order.customer.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Hub info */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{order.hub.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{order.hub.address}</p>
            </div>
          </div>

          <Separator />

          {/* Items (picking list) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Danh sách sản phẩm cần đóng gói</p>
            </div>
            <div className="space-y-2">
              {order.items.map(item => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatPrice(item.unitPrice)} / sản phẩm
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-base font-black text-emerald-600">×{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Tổng giá trị</span>
            <span className="text-xl font-black text-emerald-600">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          {isPending && (
            <Button
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => packMutation.mutate()}
              disabled={packMutation.isPending}
            >
              {packMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Xác nhận đóng gói xong
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
