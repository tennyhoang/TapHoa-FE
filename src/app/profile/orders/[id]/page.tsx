'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, RefreshCw, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

const BANK_NAME    = 'MB Bank';
const BANK_CODE    = 'MB';
const ACCOUNT_NO   = '0000000001';
const ACCOUNT_NAME = 'TAPHOA TEST';

const STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.PendingPayment,       label: 'Chờ TT'    },
  { status: OrderStatus.Paid_WaitingForBatch, label: 'Đã TT'     },
  { status: OrderStatus.ShippingToHub,        label: 'Đang giao' },
  { status: OrderStatus.InHub_ReadyForPickup, label: 'Tại Hub'   },
  { status: OrderStatus.Completed,            label: 'Xong'      },
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.status === status);

  return (
    <div className="flex items-start px-1">
      {STATUS_STEPS.map((step, i) => (
        <div key={step.status} className="flex items-start flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                ${i <= currentIdx
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'bg-white border-stone-200 text-stone-400'
                }`}
            >
              {i < currentIdx ? '✓' : i + 1}
            </div>
            <span
              className={`text-[10px] mt-1.5 text-center leading-tight font-medium w-12
                ${i <= currentIdx ? 'text-teal-600' : 'text-stone-400'}`}
            >
              {step.label}
            </span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mt-3.5 mx-0.5 transition-colors
                ${i < currentIdx ? 'bg-teal-500' : 'bg-stone-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PaymentQR({ amount, paymentRef }: { amount: number; paymentRef: string }) {
  const addInfo       = encodeURIComponent(paymentRef);
  const accountNameEnc = encodeURIComponent(ACCOUNT_NAME);
  const qrUrl         = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NO}-compact2.jpg?amount=${amount}&addInfo=${addInfo}&accountName=${accountNameEnc}`;

  const copyRef = () => {
    navigator.clipboard.writeText(paymentRef);
    toast.success('Đã sao chép mã thanh toán');
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="bg-teal-600 px-5 py-3">
        <p className="text-white font-bold text-sm">Chuyển khoản để xác nhận đơn</p>
        <p className="text-teal-200 text-xs mt-0.5">Quét mã QR hoặc chuyển khoản thủ công</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-2.5 shadow-sm border border-teal-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR thanh toán" className="w-52 h-52 object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-teal-100 overflow-hidden text-sm divide-y divide-stone-50">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-400">Ngân hàng</span>
            <span className="font-semibold text-stone-800">{BANK_NAME}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-400">Số tài khoản</span>
            <span className="font-semibold font-mono text-stone-800">{ACCOUNT_NO}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-400">Số tiền</span>
            <span className="font-black text-teal-600">{formatPrice(amount)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-stone-400">Nội dung CK</span>
            <div className="flex items-center gap-2">
              <span className="font-black font-mono text-teal-700">{paymentRef}</span>
              <button type="button" onClick={copyRef} className="text-teal-400 hover:text-teal-600 transition-colors">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-teal-600 text-center leading-relaxed">
          Hệ thống tự động xác nhận sau khi nhận được tiền (trong vòng 1 phút).
          <br />Nhập đúng nội dung chuyển khoản để được xử lý nhanh nhất.
        </p>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id }        = useParams<{ id: string }>();
  const router        = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient   = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getById(id),
    enabled:  mounted && isAuthenticated(),
    refetchInterval: (query) =>
      query.state.data?.status === OrderStatus.PendingPayment ? 15_000 : false,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: () => toast.error('Không thể hủy đơn hàng này'),
  });

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <Package className="h-12 w-12 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-400 font-medium">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const canCancel = order.status === OrderStatus.PendingPayment
    || order.status === OrderStatus.Paid_WaitingForBatch;
  const isCancelled = order.status === OrderStatus.Cancelled;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Quay lại
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-stone-900">
              Đơn #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(order.id); toast.success('Đã sao chép mã đơn'); }}
              className="text-stone-300 hover:text-teal-500 transition-colors p-1.5 rounded-lg hover:bg-teal-50"
              title="Sao chép mã đơn"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-stone-400 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <OrderStatusBadge status={order.status} />
          {order.status === OrderStatus.PendingPayment && (
            <button
              type="button"
              onClick={() => refetch()}
              className="text-stone-300 hover:text-teal-500 transition-colors p-1.5 rounded-lg hover:bg-teal-50"
              title="Làm mới trạng thái"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4 shadow-sm">
          <OrderTimeline status={order.status} />
        </div>
      )}

      {/* QR payment */}
      {order.status === OrderStatus.PendingPayment && order.paymentRef && (
        <PaymentQR amount={order.totalAmount} paymentRef={order.paymentRef} />
      )}

      {/* Hub + Products + Total */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {/* Hub */}
        <div className="px-5 py-4 flex items-start gap-3 border-b border-stone-100">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="h-4 w-4 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Điểm nhận hàng</p>
            <p className="font-semibold text-stone-800">{order.hub?.name}</p>
            {order.hub && (
              <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">
                {order.hub.address}, {order.hub.ward}, {order.hub.district}, {order.hub.city}
              </p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="px-5 pt-4 pb-3">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Sản phẩm · {order.items.length} mặt hàng
          </p>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={`${item.productId}-${i}`} className="flex gap-3 items-center">
                <div className="relative w-14 h-14 rounded-xl bg-stone-50 overflow-hidden shrink-0 border border-stone-100">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-stone-300">N/A</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1 text-stone-800">{item.productName}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    x{item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-bold shrink-0 text-stone-700">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-stone-100" />

        {/* Total */}
        <div className="px-5 py-4">
          {order.note && (
            <p className="text-sm text-stone-500 mb-3 italic">&ldquo;{order.note}&rdquo;</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-500">Tổng cộng</span>
            <span className="text-xl font-black text-teal-600">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Cancel button */}
      {canCancel && (
        <button
          type="button"
          onClick={() => { if (confirm('Xác nhận hủy đơn hàng?')) cancelMutation.mutate(); }}
          disabled={cancelMutation.isPending}
          className="w-full h-12 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
        >
          {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
        </button>
      )}
    </div>
  );
}
