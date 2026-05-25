import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';
import { ORDER_STATUS_LABEL } from '@/lib/format';

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.PendingPayment]:       'border-orange-200 bg-orange-50  text-orange-700',
  [OrderStatus.Paid_WaitingForBatch]: 'border-yellow-200 bg-yellow-50  text-yellow-700',
  [OrderStatus.ShippingToHub]:        'border-purple-200 bg-purple-50  text-purple-700',
  [OrderStatus.InHub_ReadyForPickup]: 'border-indigo-200 bg-indigo-50  text-indigo-700',
  [OrderStatus.Completed]:            'border-green-200  bg-green-50   text-green-700',
  [OrderStatus.Cancelled]:            'border-red-200    bg-red-50     text-red-600',
  [OrderStatus.Refunded]:             'border-gray-200   bg-gray-50    text-gray-600',
};

interface Props {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: Props) {
  const style = STATUS_STYLES[status] ?? 'border-gray-200 bg-gray-50 text-gray-600';
  const label = ORDER_STATUS_LABEL[status] ?? status;
  return (
    <Badge variant="outline" className={`${style} ${className ?? ''}`}>
      {label}
    </Badge>
  );
}
