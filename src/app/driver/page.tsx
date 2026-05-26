'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle2, MapPin, Search, Clock, Map as MapIcon, Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { driverService, type OptimizeRouteResponse } from '@/services/driver.service';
import { warehouseService, type Warehouse } from '@/services/warehouse.service';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate } from '@/lib/format';
import { Order } from '@/types';

function buildGoogleMapsUrl(origin: string, stops: OptimizeRouteResponse['stops']): string {
  const enc = encodeURIComponent;
  const base = 'https://www.google.com/maps/dir/?api=1&travelmode=driving';
  if (stops.length === 0) return base;
  if (stops.length === 1)
    return `${base}&origin=${enc(origin)}&destination=${enc(stops[0].address)}`;
  const waypoints = stops.slice(0, -1).map(s => enc(s.address)).join('|');
  const destination = enc(stops[stops.length - 1].address);
  return `${base}&origin=${enc(origin)}&destination=${destination}&waypoints=${waypoints}`;
}

function buildSingleStopUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

type Tab = 'pickup' | 'transit' | 'history' | 'route';

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-10 text-center space-y-3">
      <Icon className="h-10 w-10 mx-auto text-gray-200" />
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function PickupOrderCard({ order, selected, onToggle, onPickup, loading }: {
  order: Order; selected: boolean; onToggle: () => void; onPickup: () => void; loading: boolean;
}) {
  return (
    <div
      onClick={onToggle}
      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${
        selected ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        selected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
      }`}>
        {selected && (
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
        <p className="text-sm font-medium text-gray-700">{order.items.length} sản phẩm · {formatPrice(order.totalAmount)}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{order.hub?.name} — {order.hub?.district}, {order.hub?.city}</span>
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onPickup(); }}
        disabled={loading}
        className="shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
      >
        Lấy
      </button>
    </div>
  );
}

function OrderCard({ order, accentColor }: { order: Order; accentColor: string }) {
  return (
    <div className={`bg-white border ${accentColor} rounded-xl p-4 flex items-center gap-3`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm font-medium text-gray-700">{order.items.length} sản phẩm · {formatPrice(order.totalAmount)}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{order.hub?.name}</span>
        </p>
        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
      </div>
    </div>
  );
}

export default function DriverPage() {
  const router = useRouter();
  const { isAuthenticated, isDriver } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('pickup');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [customAddr, setCustomAddr] = useState('');
  const [selectedHubIds, setSelectedHubIds] = useState<Set<string> | null>(null); // null = all selected
  const [routeResult, setRouteResult] = useState<OptimizeRouteResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated() || !isDriver())) router.replace('/');
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses-active'],
    queryFn: warehouseService.getActive,
    enabled: mounted && isDriver(),
    staleTime: 5 * 60_000,
  });

  const { data: batches, isLoading: loadingPickup } = useQuery({
    queryKey: ['driver-pickup'],
    queryFn: () => orderService.getDriverOrders(),
    enabled: mounted && isDriver(),
    refetchInterval: 30_000,
  });

  const { data: inTransitData, isLoading: loadingTransit } = useQuery({
    queryKey: ['driver-transit'],
    queryFn: () => orderService.getDriverShippingOrders(),
    enabled: mounted && isDriver(),
    refetchInterval: 30_000,
    retry: false,
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['driver-history'],
    queryFn: () => orderService.getDriverCompletedOrders(),
    enabled: mounted && isDriver() && tab === 'history',
    retry: false,
  });

  const allPickupOrders = batches?.flatMap(b => b.orders) ?? [];
  const transitOrders = useMemo(() => inTransitData?.items ?? [], [inTransitData?.items]);
  const historyOrders = historyData?.items ?? [];

  // Nhóm transit orders theo hub để dùng cho lộ trình
  type HubEntry = { hubId: string; hubName: string; hubFullAddress: string; orderCount: number; totalAmount: number };
  const transitHubs = useMemo(() => {
    const map = new Map() as Map<string, HubEntry>;
    for (const order of transitOrders) {
      if (!order.hub) continue;
      if (!map.has(order.hub.id)) {
        map.set(order.hub.id, {
          hubId: order.hub.id,
          hubName: order.hub.name,
          hubFullAddress: [order.hub.address, order.hub.ward, order.hub.district, order.hub.city].filter(Boolean).join(', '),
          orderCount: 0,
          totalAmount: 0,
        });
      }
      const entry = map.get(order.hub.id)!;
      entry.orderCount++;
      entry.totalAmount += order.totalAmount;
    }
    return [...map.values()];
  }, [transitOrders]);

  // Ưu tiên đơn đang giao, fallback sang đơn cần lấy
  const routeBatches = transitHubs.length > 0 ? transitHubs : (batches ?? []);

  // null = all hubs selected (initial); Set = explicit user selection
  const effectiveSelectedHubIds = useMemo(
    () => selectedHubIds ?? new Set(routeBatches.map(b => b.hubId)),
    [selectedHubIds, routeBatches],
  );

  const toggleHub = (hubId: string) => {
    setSelectedHubIds(prev => {
      const base = prev !== null ? new Set(prev) : new Set(routeBatches.map(b => b.hubId));
      if (base.has(hubId)) base.delete(hubId); else base.add(hubId);
      return base;
    });
    setRouteResult(null);
  };

  const selectedBatches = routeBatches.filter(b => effectiveSelectedHubIds.has(b.hubId));

  const warehouseFullAddr = (w: Warehouse) =>
    [w.address, w.ward, w.district, w.province].filter(Boolean).join(', ');

  const warehouseAddr =
    selectedWarehouseId === 'custom'
      ? customAddr
      : warehouses.find(w => w.id === selectedWarehouseId)
          ? warehouseFullAddr(warehouses.find(w => w.id === selectedWarehouseId)!)
          : '';

  const pickupMutation = useMutation({
    mutationFn: (ids: string[]) => orderService.driverPickup(ids),
    onSuccess: (result: { shipped: number; errors: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['driver-pickup'] });
      queryClient.invalidateQueries({ queryKey: ['driver-transit'] });
      setSelected(new Set());
      if (result.errors?.length) {
        toast.warning(`${result.shipped} đơn thành công, ${result.errors.length} lỗi`);
      } else {
        toast.success(`Đã xác nhận lấy ${result.shipped} đơn!`);
      }
    },
    onError: () => toast.error('Lấy hàng thất bại'),
  });

  const optimizeMutation = useMutation({
    mutationFn: () => {
      const addresses = selectedBatches.map(b => b.hubFullAddress);
      return driverService.optimizeRoute(warehouseAddr, addresses);
    },
    onSuccess: (data) => {
      setRouteResult(data);
      if (!data.isOptimized) {
        toast.warning('Không tối ưu được lộ trình, hiển thị thứ tự gốc');
      }
    },
    onError: () => toast.error('Tối ưu lộ trình thất bại'),
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === allPickupOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allPickupOrders.map(o => o.id)));
    }
  };

  const filterFn = (o: Order) => !search || o.id.toLowerCase().includes(search.toLowerCase());

  if (!mounted) return null;

  const TABS = [
    { key: 'pickup'  as Tab, label: 'Cần lấy',   count: allPickupOrders.length, icon: Package, activeColor: 'text-amber-600',  bg: 'bg-amber-100 text-amber-700' },
    { key: 'transit' as Tab, label: 'Đang giao',  count: transitOrders.length,  icon: Truck,   activeColor: 'text-blue-600',   bg: 'bg-blue-100 text-blue-700' },
    { key: 'history' as Tab, label: 'Hôm nay',    count: historyOrders.length,  icon: Clock,   activeColor: 'text-green-600',  bg: 'bg-green-100 text-green-700' },
    { key: 'route'   as Tab, label: 'Lộ trình',   count: 0,                     icon: MapIcon, activeColor: 'text-purple-600', bg: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-purple-600" />
            Cổng Tài xế
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Nhận hàng từ kho, vận chuyển đến Hub</p>
        </div>
        {tab === 'pickup' && selected.size > 0 && (
          <button
            onClick={() => pickupMutation.mutate([...selected])}
            disabled={pickupMutation.isPending}
            className="shrink-0 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {pickupMutation.isPending ? 'Đang xử lý...' : `Lấy ${selected.size} đơn`}
          </button>
        )}
      </div>

      {/* Hub summary (pickup tab) */}
      {tab === 'pickup' && !loadingPickup && batches && batches.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {batches.map(batch => (
            <div key={batch.hubId} className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <p className="text-xs font-bold text-purple-700 truncate">{batch.hubName}</p>
              <p className="text-xl font-black text-purple-900 mt-0.5">{batch.orderCount} đơn</p>
              <p className="text-xs text-purple-500">{formatPrice(batch.totalAmount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className={`h-4 w-4 ${tab === t.key ? t.activeColor : ''}`} />
            <span className="hidden sm:inline">{t.label}</span>
            {t.count > 0 && (
              <span className={`text-[10px] font-black rounded-full px-1.5 py-0.5 ${
                tab === t.key ? t.bg : 'bg-gray-200 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search — ẩn ở tab lộ trình */}
      {tab !== 'route' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 bg-white"
          />
        </div>
      )}

      {/* Tab: Cần lấy */}
      {tab === 'pickup' && (
        loadingPickup ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : !allPickupOrders.length ? (
          <EmptyState icon={Package} title="Không có đơn cần lấy" sub="Các đơn đã thanh toán sẽ xuất hiện ở đây" />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-1">
              <button type="button" onClick={selectAll} className="text-xs text-purple-600 hover:underline font-medium">
                {selected.size === allPickupOrders.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
              <span className="text-xs text-gray-400">{allPickupOrders.length} đơn · đã chọn {selected.size}</span>
            </div>
            {allPickupOrders.filter(filterFn).map(order => (
              <PickupOrderCard
                key={order.id}
                order={order}
                selected={selected.has(order.id)}
                onToggle={() => toggleSelect(order.id)}
                onPickup={() => pickupMutation.mutate([order.id])}
                loading={pickupMutation.isPending}
              />
            ))}
          </div>
        )
      )}

      {/* Tab: Đang giao */}
      {tab === 'transit' && (
        loadingTransit ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : !transitOrders.length ? (
          <EmptyState icon={Truck} title="Chưa có đơn đang giao" sub="Đơn đã lấy từ kho đang vận chuyển đến Hub sẽ hiện ở đây" />
        ) : (
          <div className="space-y-2">
            {transitOrders.filter(filterFn).map(order => (
              <OrderCard key={order.id} order={order} accentColor="border-blue-100" />
            ))}
          </div>
        )
      )}

      {/* Tab: Hôm nay */}
      {tab === 'history' && (
        loadingHistory ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : !historyOrders.length ? (
          <EmptyState icon={CheckCircle2} title="Chưa có đơn hoàn thành hôm nay" sub="Lịch sử giao hàng trong ngày sẽ hiện ở đây" />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">{historyOrders.length} đơn hoàn thành hôm nay</p>
            {historyOrders.filter(filterFn).map(order => (
              <OrderCard key={order.id} order={order} accentColor="border-green-100" />
            ))}
          </div>
        )
      )}

      {/* Tab: Lộ trình */}
      {tab === 'route' && (
        <div className="space-y-4">

          {/* Chọn hub */}
          {(loadingPickup || loadingTransit) ? (
            <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : routeBatches.length === 0 ? (
            <EmptyState icon={MapIcon} title="Không có đơn nào" sub="Cần có đơn đang giao hoặc chờ lấy để tính lộ trình" />
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-700">Chọn hub cần giao</p>
                <button
                  type="button"
                  onClick={() => {
                    if (effectiveSelectedHubIds.size === routeBatches.length) {
                      setSelectedHubIds(new Set());
                    } else {
                      setSelectedHubIds(null);
                    }
                    setRouteResult(null);
                  }}
                  className="text-xs text-purple-600 hover:underline font-medium"
                >
                  {effectiveSelectedHubIds.size === routeBatches.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {routeBatches.map(batch => {
                  const isChecked = effectiveSelectedHubIds.has(batch.hubId);
                  return (
                    <div
                      key={batch.hubId}
                      onClick={() => toggleHub(batch.hubId)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-purple-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{batch.hubName}</p>
                        <p className="text-xs text-gray-400 truncate">{batch.hubFullAddress}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-purple-700">{batch.orderCount} đơn</p>
                        <p className="text-xs text-gray-400">{formatPrice(batch.totalAmount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chọn kho + nút tối ưu */}
          {routeBatches.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Kho xuất phát</p>
              <select
                value={selectedWarehouseId}
                onChange={e => { setSelectedWarehouseId(e.target.value); setRouteResult(null); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 bg-white"
              >
                <option value="">— Chọn kho —</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
                <option value="custom">Nhập địa chỉ khác...</option>
              </select>
              {selectedWarehouseId === 'custom' && (
                <input
                  type="text"
                  value={customAddr}
                  onChange={e => { setCustomAddr(e.target.value); setRouteResult(null); }}
                  placeholder="VD: 227 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 bg-white"
                />
              )}
              {selectedWarehouseId && selectedWarehouseId !== 'custom' && warehouseAddr && (
                <p className="text-xs text-gray-400">{warehouseAddr}</p>
              )}
              <button
                onClick={() => optimizeMutation.mutate()}
                disabled={!warehouseAddr.trim() || selectedBatches.length === 0 || optimizeMutation.isPending}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <MapIcon className="h-4 w-4" />
                {optimizeMutation.isPending
                  ? 'Đang tối ưu...'
                  : `Xem lộ trình${selectedBatches.length > 0 ? ` (${selectedBatches.length} hub)` : ''}`}
              </button>
              {selectedBatches.length === 0 && (
                <p className="text-xs text-amber-600">Chọn ít nhất 1 hub để tính lộ trình.</p>
              )}
            </div>
          )}

          {/* Kết quả lộ trình */}
          {routeResult && (
            <div className="space-y-3">
              {/* Nút mở Google Maps toàn tuyến */}
              <a
                href={buildGoogleMapsUrl(warehouseAddr, routeResult.stops)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Navigation className="h-4 w-4" />
                Mở Google Maps — Toàn tuyến ({routeResult.stops.length} điểm)
              </a>

              {/* Danh sách điểm theo thứ tự */}
              <div className="flex items-center gap-2 px-1">
                <p className="text-sm font-semibold text-gray-700">Thứ tự giao hàng</p>
                {routeResult.isOptimized ? (
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Đã tối ưu</span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Thứ tự gốc</span>
                )}
              </div>

              {routeResult.stops.map(stop => {
                const batch = selectedBatches[stop.originalIndex];
                return (
                  <div
                    key={stop.originalIndex}
                    className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                      {stop.stopNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {batch?.hubName ?? stop.address}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {stop.address}
                      </p>
                      {batch && (
                        <p className="text-xs text-purple-600 font-semibold mt-0.5">
                          {batch.orderCount} đơn · {formatPrice(batch.totalAmount)}
                        </p>
                      )}
                    </div>
                    <a
                      href={buildSingleStopUrl(stop.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="shrink-0 p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                      title="Chỉ đường tới điểm này"
                    >
                      <Navigation className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
