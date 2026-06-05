import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from '../orders/OrderCard';
import { OrderStatus } from '@/types';

const baseOrder = {
  id: 'abc12345-0000-0000-0000-000000000000',
  status: OrderStatus.PendingPayment,
  totalAmount: 150000,
  createdAt: '2024-06-01T08:00:00Z',
  items: [
    { productId: 'p1', productName: 'Rau muống', quantity: 2, unitPrice: 15000, subtotal: 30000 },
    { productId: 'p2', productName: 'Thịt heo', quantity: 1, unitPrice: 120000, subtotal: 120000 },
  ],
  hub: {
    id: 'h1',
    name: 'Hub Q1',
    address: '1 Lý Tự Trọng',
    ward: 'BN',
    district: 'Q1',
    city: 'HCM',
    phoneNumber: '',
    isActive: true,
  },
  paymentMethod: 'COD' as const,
  receiverName: 'Nguyễn Văn A',
  phoneNumber: '0900000000',
};

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <div className={className}>{children}</div>,
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
vi.mock('@/lib/format', () => ({
  formatPrice: (v: number) => `${v.toLocaleString('vi-VN')}₫`,
  formatDate: () => '01/06/2024',
}));

describe('OrderCard', () => {
  it('renders order id (first 8 chars uppercased)', () => {
    render(<OrderCard order={baseOrder} onCancel={vi.fn()} cancelling={false} />);
    expect(screen.getByText('#ABC12345')).toBeInTheDocument();
  });

  it('renders item count', () => {
    render(<OrderCard order={baseOrder} onCancel={vi.fn()} cancelling={false} />);
    expect(screen.getByText('2 sản phẩm')).toBeInTheDocument();
  });

  it('renders formatted total amount', () => {
    render(<OrderCard order={baseOrder} onCancel={vi.fn()} cancelling={false} />);
    expect(screen.getByText(/150\.000/)).toBeInTheDocument();
  });

  it('shows cancel button for PendingPayment status', () => {
    render(<OrderCard order={baseOrder} onCancel={vi.fn()} cancelling={false} />);
    expect(screen.getByText('Hủy đơn hàng')).toBeInTheDocument();
  });

  it('shows cancel button for Paid_WaitingForBatch status', () => {
    const order = { ...baseOrder, status: OrderStatus.Paid_WaitingForBatch };
    render(<OrderCard order={order} onCancel={vi.fn()} cancelling={false} />);
    expect(screen.getByText('Hủy đơn hàng')).toBeInTheDocument();
  });

  it('hides cancel button for Completed status', () => {
    const order = { ...baseOrder, status: OrderStatus.Completed };
    render(<OrderCard order={order} onCancel={vi.fn()} cancelling={false} />);
    expect(screen.queryByText('Hủy đơn hàng')).not.toBeInTheDocument();
  });

  it('shows "Đang hủy..." text while cancelling', () => {
    render(<OrderCard order={baseOrder} onCancel={vi.fn()} cancelling={true} />);
    expect(screen.getByText('Đang hủy...')).toBeInTheDocument();
  });

  it('calls onCancel with order id when confirmed', () => {
    const onCancel = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<OrderCard order={baseOrder} onCancel={onCancel} cancelling={false} />);
    fireEvent.click(screen.getByText('Hủy đơn hàng'));
    expect(onCancel).toHaveBeenCalledWith(baseOrder.id);
  });

  it('does not call onCancel when confirm is dismissed', () => {
    const onCancel = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<OrderCard order={baseOrder} onCancel={onCancel} cancelling={false} />);
    fireEvent.click(screen.getByText('Hủy đơn hàng'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
