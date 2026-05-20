'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Copy, Banknote, ShoppingBag,
  ArrowRight, ClipboardList, Building2, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '@/services/order.service';
import { formatPrice, formatDate } from '@/lib/format';
import { toast } from 'sonner';

const BANK_INFO = {
  bankName:      'MB Bank',
  accountNumber: '0785680242',
  accountHolder: 'CONG TY TNHH TAPHOA SACH',
};

function transferNote(orderId: string) {
  return `TAPHOA${orderId.slice(-8).toUpperCase()}`;
}

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`Đã sao chép ${label}`);
}

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => copyText(value, label)}
      className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
      title={`Sao chép ${label}`}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId') ?? '';
  const payment = params.get('payment') ?? 'COD';
  const isBankTransfer = payment === 'BankTransfer';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId,
  });

  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-gray-500">Không tìm thấy thông tin đơn hàng.</p>
        <Button asChild variant="outline"><Link href="/">Về trang chủ</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-4 px-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const note = transferNote(orderId);
  const hubAddress = order
    ? `${order.hub.address}, ${order.hub.ward}, ${order.hub.district}, ${order.hub.city}`
    : '';

  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-6">
      {/* ── Header ── */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-9 w-9 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Đặt hàng thành công!</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isBankTransfer
              ? 'Vui lòng chuyển khoản để xác nhận đơn hàng'
              : 'Đơn hàng của bạn đã được ghi nhận'}
          </p>
        </div>
      </div>

      {/* ── Order summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-sm text-gray-800">Thông tin đơn hàng</span>
        </div>

        {order ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-semibold text-gray-800">#{order.id.slice(-8).toUpperCase()}</span>
                <CopyButton value={order.id} label="mã đơn" />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày đặt</span>
              <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-gray-500 shrink-0 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Điểm nhận
              </span>
              <div className="text-right">
                <p className="font-medium text-gray-800">{order.hub.name}</p>
                <p className="text-xs text-gray-400">{hubAddress}</p>
              </div>
            </div>

            <Separator />

            {/* Product list */}
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={`${item.productId}-${i}`} className="flex justify-between text-xs">
                  <span className="text-gray-600 line-clamp-1 flex-1">
                    {item.productName}
                    <span className="text-gray-400 ml-1">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-800 ml-2 shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
              <span>Tổng thanh toán</span>
              <span className="text-emerald-600 text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">Không thể tải thông tin đơn hàng</p>
        )}
      </div>

      {/* ── Bank transfer info ── */}
      {isBankTransfer && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm text-blue-900">Thông tin chuyển khoản</span>
          </div>

          {/* VietQR */}
          {order && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.vietqr.io/image/mbbank-${BANK_INFO.accountNumber}-compact2.jpg?amount=${order.totalAmount}&addInfo=${encodeURIComponent(note)}`}
                alt="VietQR chuyển khoản"
                className="rounded-xl border border-blue-100 max-w-[220px] w-full"
              />
            </div>
          )}

          <div className="space-y-3 text-sm">
            {[
              { label: 'Ngân hàng',     value: BANK_INFO.bankName,        canCopy: false },
              { label: 'Số tài khoản',  value: BANK_INFO.accountNumber,   canCopy: true  },
              { label: 'Chủ tài khoản', value: BANK_INFO.accountHolder,   canCopy: false },
              { label: 'Số tiền',       value: order ? formatPrice(order.totalAmount) : '—', canCopy: false },
              { label: 'Nội dung CK',   value: note,                      canCopy: true  },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-blue-100">
                <span className="text-blue-700">{row.label}</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-blue-900 font-mono text-right">{row.value}</span>
                  {row.canCopy && <CopyButton value={row.value} label={row.label} />}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-2 leading-relaxed">
            Vui lòng chuyển khoản đúng <strong>nội dung</strong> và <strong>số tiền</strong> để đơn hàng được xử lý nhanh nhất.
            Đơn hàng sẽ được xác nhận trong vòng 30 phút sau khi nhận được thanh toán.
          </p>
        </div>
      )}

      {/* ── COD notice ── */}
      {!isBankTransfer && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <Banknote className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-green-800 space-y-1">
            <p className="font-semibold">Thanh toán khi nhận hàng (COD)</p>
            <p className="text-green-700">Bạn sẽ thanh toán bằng tiền mặt tại trạm hub khi nhận hàng. Không cần thực hiện thêm thao tác nào.</p>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {order && (
          <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11">
            <Link href={`/profile/orders/${order.id}`}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Xem chi tiết đơn hàng
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="flex-1 rounded-xl h-11 border-emerald-200 text-emerald-600">
          <Link href="/">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Tiếp tục mua sắm
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
