'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Package, CheckCircle2, Loader2, ChevronRight,
  Truck, UserX, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { warehouseManagerService } from '@/services/warehouse-manager.service';
import { WarehouseOrder, WarehouseDriver } from '@/types';
import { formatPrice } from '@/lib/format';

type StatusFilter = 'pending' | 'packed' | 'shipping' | 'all';

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'Chờ đóng gói', value: 'pending' },
  { label: 'Đã đóng gói', value: 'packed' },
  { label: 'Đang vận chuyển', value: 'shipping' },
  { label: 'Tất cả', value: 'all' },
];

const STATUS_LABEL: Record<string, string> = {
  Paid_WaitingForBatch: 'Chờ đóng gói',
  PackedAtWarehouse: 'Đã đóng gói',
  ShippingToHub: 'Đang vận chuyển',
};

function AssignDriverDialog({
  orders,
  drivers,
  open,
  onClose,
}: {
  orders: WarehouseOrder[];
  drivers: WarehouseDriver[];
  open: boolean;
  onClose: () => void;
}) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: (params: { driverId: string; orderIds: string[] }) =>
      warehouseManagerService.assignOrders(params.driverId, params.orderIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-dashboard'] });
      toast.success(`Đã gán ${data.assigned} đơn cho ${data.driverName}`);
      onClose();
    },
    onError: () => toast.error('Không thể gán tài xế'),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900">
          Gán tài xế cho {orders.length} đơn
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Chọn tài xế</label>
          <select
            value={selectedDriverId}
            onChange={e => setSelectedDriverId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="">-- Chọn tài xế --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.totalAssigned} đơn đang gán)
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-600">Đơn sẽ được gán:</p>
          {orders.map(o => (
            <p key={o.id} className="font-mono">
              #{o.id.slice(0, 8).toUpperCase()} — {o.customer.fullName} · {formatPrice(o.totalAmount)}
            </p>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button
            onClick={() => assignMutation.mutate({
              driverId: selectedDriverId,
              orderIds: orders.map(o => o.id),
            })}
            disabled={!selectedDriverId || assignMutation.isPending}
            className="flex-1 bg-gray-900 hover:bg-gray-800 gap-1.5"
          >
            {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Xác nhận gán
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  onPack,
  packing,
  selected,
  onToggleSelect,
  drivers,
}: {
  order: WarehouseOrder;
  onPack: (id: string) => void;
  packing: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  drivers: WarehouseDriver[];
}) {
  const router = useRouter();
  const isPending = order.status === 'Paid_WaitingForBatch';
  const isPacked = order.status === 'PackedAtWarehouse';

  return (
    <div className={`bg-white rounded-xl border p-4 space-y-3 transition-colors ${
      selected ? 'border-gray-900 ring-1 ring-gray-900/10' : 'border-gray-100'
    }`}>
      <div className="flex items-start gap-3">
        {isPacked && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(order.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/20"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1 mt-2">
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
            {order.assignedDriver && (
              <p className="flex items-center gap-1 mt-1.5">
                <Truck className="h-3 w-3 text-violet-500" />
                <span className="font-medium text-violet-600">{order.assignedDriver.fullName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-50">
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
                  Đóng gói
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
      </div>
    </div>
  );
}

export default function WarehouseOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'pending';
  const [activeStatus, setActiveStatus] = useState<StatusFilter>(initialStatus);
  const [packingId, setPackingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['warehouse-orders', activeStatus, searchText],
    queryFn: () => warehouseManagerService.getOrders({
      status: activeStatus === 'all' ? undefined : activeStatus,
      search: searchText || undefined,
      pageSize: 100,
    }),
    staleTime: 15_000,
  });

  const { data: drivers } = useQuery({
    queryKey: ['warehouse-drivers'],
    queryFn: warehouseManagerService.getDrivers,
    staleTime: 60_000,
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

  const orders = ordersData?.items ?? [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedOrders = orders.filter(o => selectedIds.has(o.id));
  const packedSelected = selectedOrders.filter(o => o.status === 'PackedAtWarehouse');

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng kho</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tên / SĐT khách..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-56"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setActiveStatus(tab.value); setSelectedIds(new Set()); }}
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

      {/* Assign bar */}
      {packedSelected.length > 0 && (
        <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3 border border-violet-200">
          <span className="text-sm text-violet-700 font-medium">
            Đã chọn {packedSelected.length} đơn đã đóng gói
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => warehouseManagerService.unassignOrders(packedSelected.map(o => o.id)).then(() => {
                queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] });
                queryClient.invalidateQueries({ queryKey: ['warehouse-drivers'] });
                toast.success('Đã hủy gán tài xế');
                setSelectedIds(new Set());
              })}
              className="text-xs h-8 gap-1.5"
            >
              <UserX className="h-3.5 w-3.5" />
              Hủy gán
            </Button>
            <Button
              size="sm"
              onClick={() => setAssignOpen(true)}
              className="text-xs h-8 gap-1.5 bg-violet-600 hover:bg-violet-700"
            >
              <Truck className="h-3.5 w-3.5" />
              Gán tài xế
            </Button>
          </div>
        </div>
      )}

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
              selected={selectedIds.has(order.id)}
              onToggleSelect={toggleSelect}
              drivers={drivers ?? []}
            />
          ))}
        </div>
      )}

      {assignOpen && drivers && (
        <AssignDriverDialog
          orders={packedSelected}
          drivers={drivers}
          open={assignOpen}
          onClose={() => { setAssignOpen(false); setSelectedIds(new Set()); }}
        />
      )}
    </div>
  );
}
