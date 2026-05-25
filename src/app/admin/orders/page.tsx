'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AdminOrderRow } from '@/components/admin/orders/AdminOrderRow';
import { orderService } from '@/services/order.service';
import { OrderStatus } from '@/types';
import { ORDER_STATUS_LABEL } from '@/lib/format';

const PAGE_SIZE = 15;

const FILTER_OPTIONS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Tất cả',                                                     value: undefined },
  { label: ORDER_STATUS_LABEL[OrderStatus.PendingPayment],               value: OrderStatus.PendingPayment },
  { label: ORDER_STATUS_LABEL[OrderStatus.Paid_WaitingForBatch],         value: OrderStatus.Paid_WaitingForBatch },
  { label: ORDER_STATUS_LABEL[OrderStatus.ShippingToHub],                value: OrderStatus.ShippingToHub },
  { label: ORDER_STATUS_LABEL[OrderStatus.InHub_ReadyForPickup],         value: OrderStatus.InHub_ReadyForPickup },
  { label: ORDER_STATUS_LABEL[OrderStatus.Completed],                    value: OrderStatus.Completed },
  { label: ORDER_STATUS_LABEL[OrderStatus.Cancelled],                    value: OrderStatus.Cancelled },
];

export default function AdminOrdersPage() {
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [search, setSearch]           = useState('');

  function handleFilterChange(status: OrderStatus | undefined) {
    setStatusFilter(status);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, search],
    queryFn:  () => orderService.getAllOrders({ page, pageSize: PAGE_SIZE, status: statusFilter, search }),
    placeholderData: prev => prev,
  });

  const orders     = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {data ? `${data.totalCount} đơn hàng` : ' '}
          </p>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Mã đơn, tên khách, SĐT..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm bg-white"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === opt.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-opacity ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Mã đơn</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Ngày đặt</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">

            {/* Skeleton rows */}
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                <td className="px-5 py-4 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                <td className="px-5 py-4"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></td>
                <td className="px-5 py-4"><Skeleton className="h-7 w-28 ml-auto rounded-lg" /></td>
              </tr>
            ))}

            {/* Empty */}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                    <Package className="h-10 w-10 opacity-25" />
                    <p className="text-sm">Không có đơn hàng nào</p>
                    {(search || statusFilter) && (
                      <button
                        className="text-xs text-emerald-600 hover:underline"
                        onClick={() => { setSearch(''); handleFilterChange(undefined); }}
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Rows */}
            {orders.map(order => <AdminOrderRow key={order.id} order={order} />)}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline" size="sm"
            className="rounded-full px-4 h-8"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Trước
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                    p === page
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline" size="sm"
            className="rounded-full px-4 h-8"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Sau →
          </Button>
        </div>
      )}
    </div>
  );
}
