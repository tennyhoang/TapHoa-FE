'use client';

import { OrderStatus } from '@/types';
import { ORDER_STATUS_LABEL } from '@/lib/format';

const FILTER_OPTIONS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: ORDER_STATUS_LABEL[OrderStatus.Pending], value: OrderStatus.Pending },
  { label: ORDER_STATUS_LABEL[OrderStatus.Confirmed], value: OrderStatus.Confirmed },
  { label: ORDER_STATUS_LABEL[OrderStatus.Shipping], value: OrderStatus.Shipping },
  { label: ORDER_STATUS_LABEL[OrderStatus.Delivered], value: OrderStatus.Delivered },
  { label: ORDER_STATUS_LABEL[OrderStatus.Cancelled], value: OrderStatus.Cancelled },
];

interface Props {
  value: OrderStatus | undefined;
  onChange: (status: OrderStatus | undefined) => void;
}

export function OrderStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTER_OPTIONS.map(opt => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
