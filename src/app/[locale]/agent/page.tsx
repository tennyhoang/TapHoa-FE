'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, MapPin, CheckCircle2, Truck, Search, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';
import { Order } from '@/types';

type Tab = 'incoming' | 'ready' | 'history';

function EmptyState({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-10 text-center space-y-3">
      <Icon className="h-10 w-10 mx-auto text-gray-200" />
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function IncomingOrderCard({
  order,
  onArrive,
  loading,
}: {
  order: Order;
  onArrive: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
        <Truck className="h-4 w-4 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-gray-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm font-medium text-gray-700 truncate">
          {order.items.length} sản phẩm · {formatPrice(order.totalAmount)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" /> {order.hub?.name}
        </p>
        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
      </div>
      <button
        onClick={onArrive}
        disabled={loading}
        className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Đã đến Hub</span>
        <span className="sm:hidden">Hub</span>
      </button>
    </div>
  );
}

function ReadyOrderCard({
  order,
  onComplete,
  loading,
}: {
  order: Order;
  onComplete: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
        <Package className="h-4 w-4 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-gray-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm font-medium text-gray-700 truncate">
          {order.items.length} sản phẩm · {formatPrice(order.totalAmount)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" /> {order.hub?.name}
        </p>
        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
      </div>
      <button
        onClick={onComplete}
        disabled={loading}
        className="shrink-0 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Khách đã lấy</span>
        <span className="sm:hidden">Xong</span>
      </button>
    </div>
  );
}

function HistoryOrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white border border-green-100 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-gray-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm font-medium text-gray-700 truncate">
          {order.items.length} sản phẩm · {formatPrice(order.totalAmount)}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" /> {order.hub?.name}
        </p>
        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
      </div>
    </div>
  );
}

export default function AgentPage() {
  const router = useRouter();
  const { isAuthenticated, isAgent } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('incoming');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated() || !isAgent())) router.replace('/');
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: incomingData, isLoading: loadingIncoming } = useQuery({
    queryKey: ['agent-orders', 'shipping'],
    queryFn: () => orderService.getAgentOrders({ status: OrderStatus.ShippingToHub }),
    enabled: mounted && isAgent(),
    refetchInterval: 30_000,
  });

  const { data: readyData, isLoading: loadingReady } = useQuery({
    queryKey: ['agent-orders', 'ready'],
    queryFn: () => orderService.getAgentOrders({ status: OrderStatus.InHub_ReadyForPickup }),
    enabled: mounted && isAgent(),
    refetchInterval: 30_000,
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['agent-orders', 'completed'],
    queryFn: () => orderService.getAgentOrders({ status: OrderStatus.Completed }),
    enabled: mounted && isAgent() && tab === 'history',
    retry: false,
  });

  const incomingOrders = incomingData?.items ?? [];
  const readyOrders = readyData?.items ?? [];
  const historyOrders = historyData?.items ?? [];

  const arriveMutation = useMutation({
    mutationFn: (orderId: string) => orderService.agentArrive(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-orders'] });
      toast.success('Xác nhận hàng đã đến Hub!');
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

  const filterFn = (o: Order) => !search || o.id.toLowerCase().includes(search.toLowerCase());

  if (!mounted) return null;

  const TABS = [
    {
      key: 'incoming' as Tab,
      label: 'Đang về Hub',
      count: incomingOrders.length,
      icon: Truck,
      activeColor: 'text-purple-600',
      bg: 'bg-purple-100 text-purple-700',
    },
    {
      key: 'ready' as Tab,
      label: 'Chờ khách lấy',
      count: readyOrders.length,
      icon: Package,
      activeColor: 'text-indigo-600',
      bg: 'bg-indigo-100 text-indigo-700',
    },
    {
      key: 'history' as Tab,
      label: 'Lịch sử',
      count: historyOrders.length,
      icon: Clock,
      activeColor: 'text-green-600',
      bg: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Cổng Agent</h1>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý đơn hàng tại Hub của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-purple-900">{incomingOrders.length}</p>
          <p className="text-xs text-purple-600 font-medium mt-0.5">Đang về</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-indigo-900">{readyOrders.length}</p>
          <p className="text-xs text-indigo-600 font-medium mt-0.5">Tại Hub</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-xl font-black text-green-900">{historyOrders.length}</p>
          <p className="text-xs text-green-600 font-medium mt-0.5">Hôm nay</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className={`h-4 w-4 ${tab === t.key ? t.activeColor : ''}`} />
            <span className="hidden sm:inline">{t.label}</span>
            {t.count > 0 && (
              <span
                className={`text-[10px] font-black rounded-full px-1.5 py-0.5 ${
                  tab === t.key ? t.bg : 'bg-gray-200 text-gray-500'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo mã đơn..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
        />
      </div>

      {/* Tab: Đang về Hub */}
      {tab === 'incoming' &&
        (loadingIncoming ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !incomingOrders.length ? (
          <EmptyState
            icon={Truck}
            title="Không có đơn nào đang về Hub"
            sub="Đơn được tài xế vận chuyển đến Hub sẽ xuất hiện ở đây"
          />
        ) : (
          <div className="space-y-2">
            {incomingOrders.filter(filterFn).map(order => (
              <IncomingOrderCard
                key={order.id}
                order={order}
                onArrive={() => arriveMutation.mutate(order.id)}
                loading={arriveMutation.isPending && arriveMutation.variables === order.id}
              />
            ))}
          </div>
        ))}

      {/* Tab: Chờ khách lấy */}
      {tab === 'ready' &&
        (loadingReady ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !readyOrders.length ? (
          <EmptyState
            icon={Package}
            title="Không có đơn nào chờ giao"
            sub="Đơn đã về Hub và chờ khách đến lấy sẽ hiện ở đây"
          />
        ) : (
          <div className="space-y-2">
            {readyOrders.filter(filterFn).map(order => (
              <ReadyOrderCard
                key={order.id}
                order={order}
                onComplete={() => completeMutation.mutate(order.id)}
                loading={completeMutation.isPending && completeMutation.variables === order.id}
              />
            ))}
          </div>
        ))}

      {/* Tab: Lịch sử */}
      {tab === 'history' &&
        (loadingHistory ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !historyOrders.length ? (
          <EmptyState
            icon={Clock}
            title="Chưa có đơn hoàn thành"
            sub="Lịch sử giao nhận tại Hub sẽ hiện ở đây"
          />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">{historyOrders.length} đơn đã hoàn thành</p>
            {historyOrders.filter(filterFn).map(order => (
              <HistoryOrderCard key={order.id} order={order} />
            ))}
          </div>
        ))}
    </div>
  );
}
