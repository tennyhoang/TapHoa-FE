import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from '../cart/CartItem';

const baseItem = {
  productId: 'prod-1',
  productName: 'Rau muống sạch',
  thumbnailUrl: 'https://example.com/img.jpg',
  unitPrice: 15000,
  quantity: 2,
  subtotal: 30000,
  stock: 10,
};

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }));
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('lucide-react', () => ({
  X: () => <span>x-icon</span>,
  Minus: () => <span>minus-icon</span>,
  Plus: () => <span>plus-icon</span>,
}));
vi.mock('@/lib/format', () => ({
  formatPrice: (v: number) => `${v.toLocaleString('vi-VN')}₫`,
}));

describe('CartItem', () => {
  it('renders product name', () => {
    render(
      <CartItem
        item={baseItem}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    expect(screen.getByText('Rau muống sạch')).toBeInTheDocument();
  });

  it('renders quantity', () => {
    render(
      <CartItem
        item={baseItem}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders subtotal', () => {
    render(
      <CartItem
        item={baseItem}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    expect(screen.getByText(/30\.000/)).toBeInTheDocument();
  });

  it('calls onRemove when X button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <CartItem
        item={baseItem}
        onUpdate={vi.fn()}
        onRemove={onRemove}
        updating={false}
        removing={false}
      />
    );
    fireEvent.click(screen.getByLabelText('Xóa sản phẩm'));
    expect(onRemove).toHaveBeenCalledWith('prod-1');
  });

  it('calls onUpdate with quantity+1 when plus is clicked', () => {
    const onUpdate = vi.fn();
    render(
      <CartItem
        item={baseItem}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    fireEvent.click(screen.getByText('plus-icon').closest('button')!);
    expect(onUpdate).toHaveBeenCalledWith('prod-1', 3);
  });

  it('calls onUpdate with quantity-1 when minus is clicked', () => {
    const onUpdate = vi.fn();
    render(
      <CartItem
        item={baseItem}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    fireEvent.click(screen.getByText('minus-icon').closest('button')!);
    expect(onUpdate).toHaveBeenCalledWith('prod-1', 1);
  });

  it('disables minus button when quantity is 1', () => {
    render(
      <CartItem
        item={{ ...baseItem, quantity: 1 }}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    expect(screen.getByText('minus-icon').closest('button')).toBeDisabled();
  });

  it('applies opacity when busy', () => {
    const { container } = render(
      <CartItem
        item={baseItem}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        updating={true}
        removing={false}
      />
    );
    expect(container.firstChild).toHaveClass('opacity-60');
  });

  it('renders placeholder when no thumbnailUrl', () => {
    render(
      <CartItem
        item={{ ...baseItem, thumbnailUrl: '' }}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        updating={false}
        removing={false}
      />
    );
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
