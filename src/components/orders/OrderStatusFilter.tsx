'use client';

import { useTranslations } from 'next-intl';
import { OrderStatus } from '@/types';

interface Props {
  value: OrderStatus | undefined;
  onChange: (status: OrderStatus | undefined) => void;
}

export function OrderStatusFilter({ value, onChange }: Props) {
  const t = useTranslations('Format.orderStatus');

  const FILTER_OPTIONS: { label: string; value: OrderStatus | undefined }[] = [
    { label: t('All'), value: undefined },
    { label: t(OrderStatus.PendingPayment), value: OrderStatus.PendingPayment },
    { label: t(OrderStatus.Paid_WaitingForBatch), value: OrderStatus.Paid_WaitingForBatch },
    { label: t(OrderStatus.ShippingToHub), value: OrderStatus.ShippingToHub },
    { label: t(OrderStatus.InHub_ReadyForPickup), value: OrderStatus.InHub_ReadyForPickup },
    { label: t(OrderStatus.Completed), value: OrderStatus.Completed },
    { label: t(OrderStatus.Cancelled), value: OrderStatus.Cancelled },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTER_OPTIONS.map(opt => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
