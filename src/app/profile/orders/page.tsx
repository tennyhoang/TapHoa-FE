'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortByAmount, setSortByAmount] = useState<'asc' | 'desc' | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', statusFilter, dateFrom, dateTo, sortByAmount],
    queryFn: () => orderService.getMyOrders({
      status: statusFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortByAmount: sortByAmount || undefined,
    }),
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

  const hasActiveFilters = !!dateFrom || !!dateTo || !!sortByAmount;

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSortByAmount('');
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>

      <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} />

      {/* Advanced filters toggle */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            Lọc nâng cao
            {hasActiveFilters && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                Đang lọc
              </span>
            )}
          </span>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showFilters && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Từ ngày</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Đến ngày</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="text-sm h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Sắp xếp theo giá</Label>
              <div className="flex gap-2">
                {[
                  { value: '',    label: 'Mặc định' },
                  { value: 'desc', label: 'Cao → Thấp' },
                  { value: 'asc',  label: 'Thấp → Cao' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortByAmount(opt.value as '' | 'asc' | 'desc')}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors font-medium ${
                      sortByAmount === opt.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20 space-y-3">
          <Package className="h-16 w-16 text-gray-300 mx-auto" />
          <p className="text-gray-500">
            {statusFilter || hasActiveFilters ? 'Không có đơn hàng nào phù hợp' : 'Bạn chưa có đơn hàng nào'}
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
