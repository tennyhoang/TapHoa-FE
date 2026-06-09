'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { warehouseManagerService } from '@/services/warehouse-manager.service';
import { WarehouseOrder } from '@/types';
import { formatPrice } from '@/lib/format';

type StatusFilter = 'pending' | 'packed' | 'shipping';

const STATUS_TABS: { label: string; value: StatusFilter; color: string }[] = [
  { label: 'Chờ đóng gói', value: 'pending', color: 'text-amber-600' },
  { label: 'Đã đóng gói', value: 'packed', color: 'text-emerald-600' },
  { label: 'Đang vận chuyển', value: 'shipping', color: 'text-blue-600' },
];

const STATUS_LABEL: Record<string, string> = {
  Paid_WaitingForBatch: 'Chờ đóng gói',
  PackedAtWarehouse: 'Đã đóng gói',
  ShippingToHub: 'Đang vận chuyển',
};

function OrderRow({
  order,
  onPack,
  packing,
}: {
  order: WarehouseOrder;
  onPack: (id: string) => void;
  packing: boolean;
}) {
  const router = useRouter();
  const isPending = order.status === 'Paid_WaitingForBatch';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900 font-mono">
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
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <span className="font-medium text-gray-700">Khách:</span> {order.customer.fullName}{' '}
          {order.customer.phoneNumber && `· ${order.customer.phoneNumber}`}
        </p>
        <p>
          <span className="font-medium text-gray-700">Hub:</span> {order.hub.name}
        </p>
        <p>
          <span className="font-medium text-gray-700">Sản phẩm:</span>{' '}
          {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="font-bold text-emerald-600">{formatPrice(order.totalAmount)}</p>
        <div className="flex items-center gap-2">
          {isPending && (
            <Button
              size="sm"
              onClick={() => onPack(order.id)}
              disabled={packing}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
            >
              {packing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Xác nhận đóng gói
            </Button>
          )}
          <button
            onClick={() => router.push(`/warehouse/orders/${order.id}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Xem chi tiết"
          >
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WarehouseOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'pending';
  const [activeStatus, setActiveStatus] = useState<StatusFilter>(initialStatus);
  const [packingId, setPackingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-orders', activeStatus],
    queryFn: () => warehouseManagerService.getOrders({ status: activeStatus, pageSize: 50 }),
    staleTime: 15_000,
  });

  const packMutation = useMutation({
    mutationFn: (id: string) => warehouseManagerService.packOrder(id),
    onMutate: id => setPackingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-dashboard'] });
      toast.success('Đã xác nhận đóng gói đơn hàng');
    },
    onError: () => toast.error('Không thể cập nhật trạng thái đơn hàng'),
    onSettled: () => setPackingId(null),
  });

  const orders = data?.items ?? [];

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Đơn hàng kho</h1>

      {/* Status tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeStatus === tab.value
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Package className="h-12 w-12 text-gray-200" />
          <p className="text-sm text-gray-400">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              onPack={id => packMutation.mutate(id)}
              packing={packingId === order.id && packMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
