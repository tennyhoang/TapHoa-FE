import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../landing/HeroSection';

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.raw = (key: string) => {
      if (key === 'slides') {
        return [
          {
            eyebrow: 'Tươi ngon',
            title: 'Đồ ăn\nsạch',
            sub: 'Giao tận nơi',
            cta: 'Mua ngay',
            href: '/products',
          },
        ];
      }
      return key;
    };
    return t;
  },
}));

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }));
vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('HeroSection', () => {
  it('should render the section', () => {
    render(<HeroSection />);
    expect(screen.getByText('Tươi ngon')).toBeInTheDocument();
    expect(screen.getByText('Mua ngay')).toBeInTheDocument();
  });
});
