'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&q=85&auto=format&fit=crop',
    eyebrow: 'VietGAP Certified',
    title: 'Rau củ quả\ntươi sạch',
    sub: 'Thu hoạch sáng — giao tận Hub buổi chiều. Kiểm định chất lượng từng lô hàng.',
    cta: 'Chọn rau củ',
    href: '/products?search=rau+c%E1%BB%A7',
    accent: 'oklch(0.54 0.158 145)',
  },
  {
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=1400&q=85&auto=format&fit=crop',
    eyebrow: 'Mới về hôm nay',
    title: 'Trái cây tươi\nnhập khẩu',
    sub: 'Nguồn gốc rõ ràng từ nông trại đối tác — ngọt, mọng nước, an toàn cho cả gia đình.',
    cta: 'Khám phá trái cây',
    href: '/products?search=tr%C3%A1i+c%C3%A2y',
    accent: 'oklch(0.75 0.155 55)',
  },
  {
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=85&auto=format&fit=crop',
    eyebrow: 'Tiết kiệm mỗi ngày',
    title: 'Combo gia đình\ngiá tốt',
    sub: 'Bộ thực phẩm thiết yếu được tuyển chọn kỹ — nhận nhanh tại Hub gần nhà bạn nhất.',
    cta: 'Xem combo',
    href: '/products?isDiscount=true',
    accent: 'oklch(0.57 0.135 196)',
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 300);
  }, [animating]);

  useEffect(() => {
    const t = setInterval(() => {
      go((current + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(t);
  }, [current, go]);

  const slide = SLIDES[current];

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(360px, 52vw, 560px)' }}>
      {/* Background images */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* Editorial overlay: dark gradient from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.10_0.02_195/0.88)] via-[oklch(0.10_0.02_195/0.55)] to-transparent" />
        </div>
      ))}

      {/* Mobile bottom gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.02_195/0.70)] via-transparent to-transparent sm:hidden pointer-events-none" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
        <div
          className="text-white max-w-lg pl-10 sm:pl-0"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase tracking-[0.15em]"
            style={{
              background: `${slide.accent}33`,
              color: 'white',
              border: `1px solid ${slide.accent}66`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: slide.accent }}
            />
            {slide.eyebrow}
          </span>

          <h1 className="font-editorial font-black text-white mb-4 leading-[1.05]"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)' }}
          >
            {slide.title.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>

          <p className="text-white/75 text-sm leading-relaxed mb-5 sm:mb-8 max-w-md">
            {slide.sub}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 bg-white text-foreground font-bold px-7 py-3 rounded-full text-sm hover:bg-primary hover:text-white transition-all duration-200 shadow-lg"
            >
              {slide.cta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link
              href="/products"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors underline-offset-2 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-400"
            style={{
              height: '3px',
              width: i === current ? '32px' : '12px',
              borderRadius: '2px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => go((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
        aria-label="Trước"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={() => go((current + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
        aria-label="Sau"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Slide counter */}
      <div className="absolute top-5 right-6 text-white/60 text-xs font-mono z-10 hidden md:block">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </div>
  );
}
