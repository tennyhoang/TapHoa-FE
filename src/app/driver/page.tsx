'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle2, MapPin, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate } from '@/lib/format';

export default function DriverPage() {
  const router = useRouter();
  const { isAuthenticated, isDriver } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated() || !isDriver())) router.replace('/');
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: batches, isLoading } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: () => orderService.getDriverOrders(),
    enabled: mounted && isDriver(),
    refetchInterval: 30_000,
  });

  // Flatten all orders from all hub batches
  const allOrders = batches?.flatMap(b => b.orders) ?? [];

  const pickupMutation = useMutation({
    mutationFn: (ids: string[]) => orderService.driverPickup(ids),
    onSuccess: (result: { shipped: number; errors: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
      setSelected(new Set());
      if (result.errors?.length) {
        toast.warning(`${result.shipped} đơn thành công, ${result.errors.length} lỗi`);
      } else {
        toast.success(`Đã xác nhận lấy ${result.shipped} đơn hàng!`);
      }
    },
    onError: () => toast.error('Lấy hàng thất bại'),
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!allOrders.length) return;
    if (selected.size === allOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allOrders.map(o => o.id)));
    }
  };

  const filtered = allOrders.filter(o =>
    !search || o.id.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-purple-600" />
            Cổng Tài xế
          </h1>
          <p className="text-sm text-gray-500 mt-1">Nhận hàng từ kho và vận chuyển đến Hub</p>
        </div>

        {selected.size > 0 && (
          <button
            onClick={() => pickupMutation.mutate([...selected])}
            disabled={pickupMutation.isPending}
            className="shrink-0 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {pickupMutation.isPending ? 'Đang xử lý...' : `Lấy ${selected.size} đơn`}
          </button>
        )}
      </div>

      {/* Hub summary */}
      {!isLoading && batches && batches.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {batches.map(batch => (
            <div key={batch.hubId} className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <p className="text-xs font-bold text-purple-700 truncate">{batch.hubName}</p>
              <p className="text-sm font-black text-purple-900 mt-0.5">{batch.orderCount} đơn</p>
              <p className="text-xs text-purple-600">{formatPrice(batch.totalAmount)}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !allOrders.length ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-400 space-y-3">
          <Package className="h-12 w-12 mx-auto text-gray-200" />
          <p className="text-base font-medium">Không có đơn nào cần lấy</p>
          <p className="text-sm">Các đơn đã thanh toán sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn hàng..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
            />
          </div>

          <div className="flex items-center gap-3 px-1 pb-1">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              {selected.size === allOrders.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <span className="text-xs text-gray-400">
              {allOrders.length} đơn chờ lấy · {selected.size} đã chọn
            </span>
          </div>

          {filtered.map(order => (
            <div
              key={order.id}
              onClick={() => toggleSelect(order.id)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${
                selected.has(order.id)
                  ? 'border-purple-400 bg-purple-50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected.has(order.id) ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
              }`}>
                {selected.has(order.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {order.items.length} sản phẩm · {formatPrice(order.totalAmount)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {order.hub?.name} — {order.hub?.district}, {order.hub?.city}
                </p>
                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); pickupMutation.mutate([order.id]); }}
                disabled={pickupMutation.isPending}
                className="shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Lấy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
