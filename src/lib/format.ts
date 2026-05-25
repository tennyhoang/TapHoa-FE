export const formatPrice = (price: number | string | undefined | null) => {
  const n = Number(price);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    isFinite(n) ? n : 0
  );
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PendingPayment:       'Chờ thanh toán',
  Paid_WaitingForBatch: 'Chờ gom hàng',
  ShippingToHub:        'Đang vận chuyển',
  InHub_ReadyForPickup: 'Sẵn sàng lấy hàng',
  Completed:            'Hoàn thành',
  Cancelled:            'Đã hủy',
  Refunded:             'Đã hoàn tiền',
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
