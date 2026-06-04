import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '../layout/Footer';

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('lucide-react', () => ({
  MapPin: () => <span>map-icon</span>,
  Phone: () => <span>phone-icon</span>,
  Mail: () => <span>mail-icon</span>,
  Leaf: () => <span>leaf-icon</span>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />);
    expect(screen.getAllByText('TapHoa').length).toBeGreaterThan(0);
  });

  it('renders contact email', () => {
    render(<Footer />);
    expect(screen.getByText('support@taphoa.vn')).toBeInTheDocument();
  });

  it('renders hotline', () => {
    render(<Footer />);
    expect(screen.getByText('1800 6868')).toBeInTheDocument();
  });

  it('renders hub locations', () => {
    render(<Footer />);
    expect(screen.getByText('Hub Quận 1')).toBeInTheDocument();
    expect(screen.getByText('Hub Bình Thạnh')).toBeInTheDocument();
    expect(screen.getByText('Hub Hoàn Kiếm')).toBeInTheDocument();
  });

  it('renders payment method badges', () => {
    render(<Footer />);
    expect(screen.getByText('VietQR')).toBeInTheDocument();
    expect(screen.getByText('COD')).toBeInTheDocument();
  });

  it('shows newsletter email input', () => {
    render(<Footer />);
    expect(screen.getByPlaceholderText('Email của bạn...')).toBeInTheDocument();
  });

  it('clears email input and shows toast on newsletter subscribe', async () => {
    const { toast } = await import('sonner');
    render(<Footer />);
    const input = screen.getByPlaceholderText('Email của bạn...');
    fireEvent.change(input, { target: { value: 'test@test.com' } });
    fireEvent.submit(input.closest('form')!);
    expect(toast.success).toHaveBeenCalledOnce();
    expect(input).toHaveValue('');
  });

  it('renders copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 TapHoa/)).toBeInTheDocument();
  });
});
