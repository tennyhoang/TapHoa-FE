'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, MapPin, StickyNote, AlertTriangle, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { orderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

// BE uses JsonStringEnumConverter so responses are strings, but keep numeric fallback
const STATUS_FROM_NUMBER: Record<number, OrderStatus> = {
  0: OrderStatus.Pending,
  1: OrderStatus.Confirmed,
  2: OrderStatus.Shipping,
  3: OrderStatus.ArrivedAtHub,
  4: OrderStatus.Delivered,
  5: OrderStatus.Cancelled,
  6: OrderStatus.Refunded,
};

function resolveStatus(raw: unknown): OrderStatus {
  if (typeof raw === 'number') return STATUS_FROM_NUMBER[raw] ?? OrderStatus.Pending;
  const s = String(raw);
  return (
    (Object.values(OrderStatus).find(v => v.toLowerCase() === s.toLowerCase()) as OrderStatus) ??
    OrderStatus.Pending
  );
}

// ─── Admin can only confirm Pending orders and cancel Pending/Confirmed ────────

function getAdminActions(status: OrderStatus): { confirm?: true; cancel?: true } {
  if (status === OrderStatus.Pending)   return { confirm: true, cancel: true };
  if (status === OrderStatus.Confirmed) return { cancel: true };
  return {};
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { order: Order }

export function AdminOrderRow({ order }: Props) {
  const queryClient = useQueryClient();
  const [expanded,      setExpanded]      = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = resolveStatus(order.status);
  const actions = getAdminActions(status);

  const confirmMutation = useMutation({
    mutationFn: () => orderService.updateOrderStatus(order.id, OrderStatus.Confirmed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Đã xác nhận đơn hàng');
    },
    onError: () => toast.error('Xác nhận thất bại'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.updateOrderStatus(order.id, OrderStatus.Cancelled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Đã hủy đơn hàng');
      setConfirmCancel(false);
    },
    onError: () => {
      toast.error('Hủy đơn thất bại');
      setConfirmCancel(false);
    },
  });

  const hubAddress = order.hub
    ? `${order.hub.address}, ${order.hub.ward}, ${order.hub.district}, ${order.hub.city}`
    : '';

  const isPending = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <>
      {/* ── Main row ── */}
      <tr className="group hover:bg-emerald-50 transition-colors">

        {/* Order ID */}
        <td className="px-5 py-4">
          <span className="font-mono text-xs font-bold text-gray-400 group-hover:text-emerald-600 transition-colors">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </td>

        {/* Customer */}
        <td className="px-5 py-4">
          <p className="font-semibold text-gray-800 text-sm leading-snug">
            {order.userFullName ?? '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{order.customerEmail ?? ''}</p>
        </td>

        {/* Date */}
        <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-500 whitespace-nowrap">
          {formatDate(order.createdAt)}
        </td>

        {/* Total */}
        <td className="px-5 py-4 text-right">
          <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">
            {formatPrice(order.totalAmount)}
          </span>
        </td>

        {/* Status */}
        <td className="px-5 py-4 text-center">
          <OrderStatusBadge status={status} />
        </td>

        {/* Actions — Admin: Confirm (Pending) + Cancel (Pending/Confirmed) */}
        <td className="px-5 py-4">
          <div className="flex gap-1.5 justify-end items-center flex-wrap">
            {actions.confirm && (
              <button
                disabled={isPending}
                onClick={() => confirmMutation.mutate()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
                  bg-blue-500 hover:bg-blue-600 text-white"
              >
                {confirmMutation.isPending ? '...' : 'Xác nhận'}
              </button>
            )}
            {actions.cancel && (
              <button
                disabled={isPending}
                onClick={() => setConfirmCancel(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
                  bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300"
              >
                Hủy đơn
              </button>
            )}

            <button
              onClick={() => setExpanded(e => !e)}
              className={`p-1.5 rounded-lg transition-colors ${
                expanded
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label={expanded ? 'Thu gọn' : 'Xem chi tiết'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </td>
      </tr>

      {/* ── Expanded detail ── */}
      {expanded && (
        <tr className="bg-gray-50/60">
          <td colSpan={6} className="px-5 pt-1 pb-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 grid md:grid-cols-2 gap-6 text-sm">

              {/* Hub info */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Điểm nhận hàng
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <span className="font-medium">{order.userFullName ?? '—'}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <span>{order.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.hub?.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{hubAddress}</p>
                    </div>
                  </div>
                  {order.note && (
                    <div className="flex items-start gap-2.5 bg-amber-50 rounded-lg px-3 py-2">
                      <StickyNote className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="italic text-amber-700 text-xs">{order.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Sản phẩm ({order.items.length})
                </p>
                <div className="space-y-2.5">
                  {order.items.map((item, i) => (
                    <div key={`${item.productId}-${i}`} className="flex justify-between gap-3">
                      <span className="line-clamp-1 flex-1 text-gray-700">
                        {item.productName}
                        <span className="text-gray-400 ml-1.5 text-xs">×{item.quantity}</span>
                      </span>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-gray-800">{formatPrice(item.subtotal)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">{formatPrice(item.unitPrice)} / cái</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-600">Tổng cộng</span>
                  <span className="text-emerald-600 text-base">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}

      {/* ── Cancel confirm dialog ── */}
      <Dialog open={confirmCancel} onOpenChange={open => !open && setConfirmCancel(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-gray-500 leading-relaxed mt-1">
            Bạn có chắc muốn hủy đơn{' '}
            <span className="font-mono font-bold text-gray-700">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>{' '}
            của khách <span className="font-semibold text-gray-700">{order.userFullName ?? '—'}</span>?
            Hành động này không thể hoàn tác.
          </p>

          <div className="flex gap-2 justify-end mt-5">
            <Button
              variant="outline" size="sm" className="rounded-lg"
              onClick={() => setConfirmCancel(false)}
              disabled={cancelMutation.isPending}
            >
              Bỏ qua
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
