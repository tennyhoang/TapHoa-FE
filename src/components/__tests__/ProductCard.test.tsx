import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../products/ProductCard';
import type { Product } from '@/types';

const baseProduct: Product = {
  id: 'prod-1',
  name: 'Bánh mì que',
  price: 15000,
  stock: 10,
  categoryId: 'cat-1',
  categoryName: 'Đồ ăn',
  averageRating: 4,
  reviewCount: 12,
  images: ['/img1.jpg'],
  createdAt: '2024-06-01T00:00:00Z',
};

const mockMutate = vi.hoisted(() => vi.fn());

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }));
vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('lucide-react', () => ({
  ShoppingCart: () => <span>cart-icon</span>,
  Star: () => <span>star-icon</span>,
}));
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: mockMutate, isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock('@/services/cart.service', () => ({ cartService: { add: vi.fn() } }));
vi.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({ isAuthenticated: () => true }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('ProductCard', () => {
  it('should render product name', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Bánh mì que')).toBeInTheDocument();
  });

  it('should render product price', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(content => content.includes('15.000'))).toBeInTheDocument();
  });

  it('should render out-of-stock overlay when stock is 0', () => {
    render(<ProductCard product={{ ...baseProduct, stock: 0 }} />);
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
  });

  it('should call add-to-cart mutation on button click', () => {
    render(<ProductCard product={baseProduct} />);
    fireEvent.click(screen.getByText('Thêm vào giỏ'));
    expect(mockMutate).toHaveBeenCalledOnce();
  });
});
