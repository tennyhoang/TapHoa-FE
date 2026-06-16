'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const SLIDE_ASSETS = [
  {
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&q=85&auto=format&fit=crop',
    accent: 'oklch(0.54 0.158 145)',
  },
  {
    image:
      'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=1400&q=85&auto=format&fit=crop',
    accent: 'oklch(0.75 0.155 55)',
  },
  {
    image:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=85&auto=format&fit=crop',
    accent: 'oklch(0.57 0.135 196)',
  },
];

export function HeroSection() {
  const t = useTranslations('HeroSection');
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const SLIDES = t.raw('slides') as {
    eyebrow: string;
    title: string;
    sub: string;
    cta: string;
    href: string;
  }[];

  const go = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(next);
        setAnimating(false);
      }, 300);
    },
    [animating]
  );

  useEffect(() => {
    const t = setInterval(() => {
      go((current + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(t);
  }, [current, go, SLIDES.length]);

  const slide = SLIDES[current];
  const asset = SLIDE_ASSETS[current];

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(380px, 54vw, 580px)' }}>
      {SLIDE_ASSETS.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="(max-width: 1280px) calc(100vw - 2rem), 1280px"
          />
          {/* Stronger left overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.10_0.02_195/0.93)] via-[oklch(0.10_0.02_195/0.60)] to-transparent" />
        </div>
      ))}

      {/* Mobile bottom-up overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.02_195/0.75)] via-transparent to-transparent sm:hidden pointer-events-none" />

      <div className="relative h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
        <div
          className="text-white max-w-xl pl-10 sm:pl-0"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(14px)' : 'translateY(0)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 uppercase tracking-[0.15em]"
            style={{
              background: `${asset.accent}33`,
              color: 'white',
              border: `1px solid ${asset.accent}66`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: asset.accent }} />
            {slide?.eyebrow}
          </span>

          <h1
            className="font-black text-white mb-4 leading-[1.03] tracking-tight"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)' }}
          >
            {slide?.title?.split('\n').map((line: string, i: number) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
            {slide?.sub}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={slide?.href ?? '/'}
              className="inline-flex items-center gap-2 bg-white text-foreground font-bold px-8 py-3.5 rounded-full text-sm hover:bg-primary hover:text-white active:scale-95 transition-all duration-200 shadow-lg"
            >
              {slide?.cta}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 border border-white/40 hover:border-white/70 text-white/90 hover:text-white font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-200 active:scale-95"
            >
              {t('viewAll')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar: dots left, counter right */}
      <div className="absolute bottom-5 left-0 right-0 px-5 flex items-center justify-between z-10">
        <div className="flex gap-2">
          {SLIDES.map((_: unknown, i: number) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-400"
              style={{
                height: '3px',
                width: i === current ? '28px' : '10px',
                borderRadius: '2px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <span className="text-white/45 text-[10px] tabular-nums hidden sm:block">
          {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      <button
        onClick={() => go((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
        aria-label={t('prevSlide')}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => go((current + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
        aria-label={t('nextSlide')}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
