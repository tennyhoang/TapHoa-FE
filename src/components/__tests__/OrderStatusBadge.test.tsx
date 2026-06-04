import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderStatusBadge } from '../orders/OrderStatusBadge';
import { OrderStatus } from '@/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      PendingPayment: 'Chờ thanh toán',
      Paid_WaitingForBatch: 'Đã thanh toán',
      ShippingToHub: 'Đang vận chuyển',
      InHub_ReadyForPickup: 'Tại kho',
      Completed: 'Hoàn thành',
      Cancelled: 'Đã huỷ',
      Refunded: 'Đã hoàn tiền',
    };
    return translations[key] || key;
  },
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <div data-testid="badge" className={className}>
      {children}
    </div>
  ),
}));

describe('OrderStatusBadge', () => {
  const cases = [
    { status: OrderStatus.PendingPayment, label: 'Chờ thanh toán', colorHint: 'teal' },
    { status: OrderStatus.Paid_WaitingForBatch, label: 'Đã thanh toán', colorHint: 'cyan' },
    { status: OrderStatus.ShippingToHub, label: 'Đang vận chuyển', colorHint: 'purple' },
    { status: OrderStatus.InHub_ReadyForPickup, label: 'Tại kho', colorHint: 'indigo' },
    { status: OrderStatus.Completed, label: 'Hoàn thành', colorHint: 'green' },
    { status: OrderStatus.Cancelled, label: 'Đã huỷ', colorHint: 'red' },
    { status: OrderStatus.Refunded, label: 'Đã hoàn tiền', colorHint: 'gray' },
  ];

  cases.forEach(({ status, label, colorHint }) => {
    it(`should render correct label and color for ${status}`, () => {
      render(<OrderStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId('badge').className).toContain(colorHint);
    });
  });
});
