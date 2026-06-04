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
    <div className="bg-card rounded-xl p-4 border border-border/60 hover:border-border transition-colors space-y-3">
      <Link href={`/profile/orders/${order.id}`} className="block space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-muted-foreground">{order.items.length} sản phẩm</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
        </div>
      </Link>

      {(order.status === OrderStatus.PendingPayment ||
        order.status === OrderStatus.Paid_WaitingForBatch) && (
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
