'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';

interface Props {
  order: Order;
  onCancel: (id: string) => void;
  cancelling: boolean;
}

export function OrderCard({ order, onCancel, cancelling }: Props) {
  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    if (confirm('Xác nhận hủy đơn hàng này?')) onCancel(order.id);
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors space-y-3">
      <Link href={`/profile/orders/${order.id}`} className="block space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-500">{order.items.length} sản phẩm</p>
            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
          <p className="font-bold text-emerald-600">{formatPrice(order.totalAmount)}</p>
        </div>
      </Link>

      {order.status === OrderStatus.Pending && (
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
        </Button>
      )}
    </div>
  );
}
