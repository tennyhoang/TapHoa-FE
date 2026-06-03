export const formatPrice = (price: number | string | undefined | null) => {
  const n = Number(price);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    isFinite(n) ? n : 0
  );
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const ORDER_STATUS_KEYS: Record<string, string> = {
  PendingPayment:       'Format.orderStatus.PendingPayment',
  Paid_WaitingForBatch: 'Format.orderStatus.Paid_WaitingForBatch',
  ShippingToHub:        'Format.orderStatus.ShippingToHub',
  InHub_ReadyForPickup: 'Format.orderStatus.InHub_ReadyForPickup',
  Completed:            'Format.orderStatus.Completed',
  Cancelled:            'Format.orderStatus.Cancelled',
  Refunded:             'Format.orderStatus.Refunded',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PendingPayment:       'bg-orange-100 text-orange-800',
  Paid_WaitingForBatch: 'bg-yellow-100 text-yellow-800',
  ShippingToHub:        'bg-purple-100 text-purple-800',
  InHub_ReadyForPickup: 'bg-indigo-100 text-indigo-800',
  Completed:            'bg-green-100 text-green-800',
  Cancelled:            'bg-red-100 text-red-800',
  Refunded:             'bg-gray-100 text-gray-700',
};
