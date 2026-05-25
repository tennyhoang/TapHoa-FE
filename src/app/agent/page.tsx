'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, MapPin, CheckCircle2, Truck, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

export default function AgentPage() {
  const router = useRouter();
  const { isAuthenticated, isAgent } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated() || !isAgent())) router.replace('/');
  }, [mounted]);

  const { data: shippingOrders, isLoading: loadingShipping } = useQuery({
    queryKey: ['agent-orders', 'shipping'],
    queryFn: () => orderService.getAgentOrders({ status: OrderStatus.ShippingToHub }),
    enabled: mounted && isAgent(),
    refetchInterval: 30_000,
  });

  const { data: arrivedOrders, isLoading: loadingArrived } = useQuery({
    queryKey: ['agent-orders', 'arrived'],
    queryFn: () => orderService.getAgentOrders({ status: OrderStatus.InHub_ReadyForPickup }),
    enabled: mounted && isAgent(),
    refetchInterval: 30_000,
  });

  const arriveMutation = useMutation({
    mutationFn: (orderId: string) => orderService.agentArrive(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-orders'] });
      toast.success('Đã xác nhận hàng đến Hub!');
    },
    onError: () => toast.error('Xác nhận thất bại'),
  });

  const completeMutation = useMutation({
    mutationFn: (orderId: string) => orderService.agentCompletePickup(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-orders'] });
      toast.success('Hoàn tất giao nhận!');
    },
    onError: () => toast.error('Xác nhận thất bại'),
  });

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Cổng Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý đơn hàng tại Hub của bạn</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn hàng..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        />
      </div>

      {/* ── Shipping → ArrivedAtHub ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-purple-600" />
          <h2 className="font-bold text-gray-900">Đơn đang vận chuyển đến Hub</h2>
          <span className="text-xs bg-purple-100 text-purple-700 font-semibold rounded-full px-2 py-0.5">
            {shippingOrders?.items.length ?? 0}
          </span>
        </div>

        {loadingShipping ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : !shippingOrders?.items.length ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            Không có đơn nào đang vận chuyển
          </div>
        ) : (
          <div className="space-y-2">
            {shippingOrders.items.filter(o =>
              !search || o.id.toLowerCase().includes(search.toLowerCase())
            ).map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 line-clamp-1">
                    {order.items.length} sản phẩm · {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {order.hub?.name}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <button
                  onClick={() => arriveMutation.mutate(order.id)}
                  disabled={arriveMutation.isPending && arriveMutation.variables === order.id}
                  className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã đến Hub
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* ── ArrivedAtHub → Delivered ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          <h2 className="font-bold text-gray-900">Khách đến lấy hàng</h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold rounded-full px-2 py-0.5">
            {arrivedOrders?.items.length ?? 0}
          </span>
        </div>

        {loadingArrived ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : !arrivedOrders?.items.length ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            Không có đơn nào chờ giao nhận
          </div>
        ) : (
          <div className="space-y-2">
            {arrivedOrders.items.filter(o =>
              !search || o.id.toLowerCase().includes(search.toLowerCase())
            ).map(order => (
              <div key={order.id} className="bg-white border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 line-clamp-1">
                    {order.items.length} sản phẩm · {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {order.hub?.name}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <button
                  onClick={() => completeMutation.mutate(order.id)}
                  disabled={completeMutation.isPending && completeMutation.variables === order.id}
                  className="shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã giao khách
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
