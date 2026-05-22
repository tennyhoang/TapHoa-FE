'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

const BANK_NAME   = 'MB Bank';
const BANK_CODE   = 'MB';
const ACCOUNT_NO  = '0000000001';
const ACCOUNT_NAME = 'TAPHOA TEST';

function PaymentQR({ amount, paymentRef }: { amount: number; paymentRef: string }) {
  const addInfo = encodeURIComponent(paymentRef);
  const accountNameEnc = encodeURIComponent(ACCOUNT_NAME);
  const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NO}-compact2.jpg?amount=${amount}&addInfo=${addInfo}&accountName=${accountNameEnc}`;

  const copyRef = () => {
    navigator.clipboard.writeText(paymentRef);
    toast.success('Đã sao chép mã thanh toán');
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-4">
      <div className="text-center space-y-1">
        <p className="font-bold text-orange-800 text-base">Chuyển khoản để xác nhận đơn hàng</p>
        <p className="text-sm text-orange-600">Quét mã QR hoặc chuyển khoản thủ công</p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-2 shadow-sm border border-orange-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR thanh toán" className="w-52 h-52 object-contain" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-orange-100 divide-y divide-orange-50 text-sm">
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-gray-500">Ngân hàng</span>
          <span className="font-semibold">{BANK_NAME}</span>
        </div>
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-gray-500">Số tài khoản</span>
          <span className="font-semibold font-mono">{ACCOUNT_NO}</span>
        </div>
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-gray-500">Số tiền</span>
          <span className="font-bold text-orange-700">{formatPrice(amount)}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-gray-500">Nội dung CK</span>
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-orange-700">{paymentRef}</span>
            <button type="button" onClick={copyRef} className="text-orange-500 hover:text-orange-700">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-orange-600 text-center">
        Hệ thống tự động xác nhận sau khi nhận được tiền (thường trong vòng 1 phút).
        <br />Vui lòng nhập đúng nội dung chuyển khoản.
      </p>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
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
    queryFn: () => orderService.getById(id),
    enabled: mounted && isAuthenticated(),
    // Auto-refresh mỗi 15s khi đơn đang chờ thanh toán
    refetchInterval: (query) =>
      query.state.data?.status === OrderStatus.PendingPayment ? 15_000 : false,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: () => toast.error('Không thể hủy đơn hàng này'),
  });

  if (!mounted) return null;

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>;
  }

  if (!order) return <div className="text-center py-20 text-gray-400">Không tìm thấy đơn hàng</div>;

  const canCancel = order.status === OrderStatus.PendingPayment
    || order.status === OrderStatus.Paid_WaitingForBatch;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Đơn #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {order.status === OrderStatus.PendingPayment && (
            <button type="button" onClick={() => refetch()} className="text-gray-400 hover:text-gray-600" title="Làm mới trạng thái">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* QR thanh toán — chỉ hiện khi chờ thanh toán */}
      {order.status === OrderStatus.PendingPayment && order.paymentRef && (
        <PaymentQR amount={order.totalAmount} paymentRef={order.paymentRef} />
      )}

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Điểm nhận hàng</h2>
        <p className="text-sm font-medium">{order.hub?.name}</p>
        <p className="text-sm text-gray-500">
          {order.hub ? `${order.hub.address}, ${order.hub.ward}, ${order.hub.district}, ${order.hub.city}` : ''}
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <h2 className="font-semibold">Sản phẩm</h2>
        {order.items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex gap-3 items-center">
            <div className="relative w-14 h-14 bg-gray-50 rounded-md overflow-hidden shrink-0">
              {item.thumbnailUrl ? (
                <Image src={item.thumbnailUrl} alt={item.productName} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">N/A</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
              <p className="text-xs text-gray-500">x{item.quantity} × {formatPrice(item.unitPrice)}</p>
            </div>
            <p className="text-sm font-bold shrink-0">{formatPrice(item.subtotal)}</p>
          </div>
        ))}
      </div>

      <Separator />

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <div className="flex justify-between font-bold text-lg">
          <span>Tổng cộng</span>
          <span className="text-emerald-600">{formatPrice(order.totalAmount)}</span>
        </div>
        {order.note && <p className="text-sm text-gray-500">Ghi chú: {order.note}</p>}
      </div>

      {canCancel && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => { if (confirm('Xác nhận hủy đơn hàng?')) cancelMutation.mutate(); }}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
        </Button>
      )}
    </div>
  );
}
