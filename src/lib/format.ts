export const formatPrice = (price: number | string | undefined | null) => {
  const n = Number(price);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    isFinite(n) ? n : 0
  );
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(date)
  );
