export const formatPrice = (price: number | string | undefined | null) => {
  const n = Number(price);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    isFinite(n) ? n : 0
  );
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const ORDER_STATUS_LABEL: Record<string, string> = {
  Pending:      'Chờ xác nhận',
  Confirmed:    'Đã xác nhận',
  Shipping:     'Đang vận chuyển',
  ArrivedAtHub: 'Đã đến Hub',
  Delivered:    'Đã giao',
  Cancelled:    'Đã hủy',
  Refunded:     'Đã hoàn tiền',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  Pending:      'bg-yellow-100 text-yellow-800',
  Confirmed:    'bg-blue-100 text-blue-800',
  Shipping:     'bg-purple-100 text-purple-800',
  ArrivedAtHub: 'bg-indigo-100 text-indigo-800',
  Delivered:    'bg-green-100 text-green-800',
  Cancelled:    'bg-red-100 text-red-800',
  Refunded:     'bg-gray-100 text-gray-700',
};
