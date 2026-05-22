'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';

const SIDEBAR_CATS = [
  { label: 'Rau củ quả' },
  { label: 'Trái cây tươi' },
  { label: 'Thịt & Cá tươi' },
  { label: 'Trứng & Sữa' },
  { label: 'Gạo & Ngũ cốc' },
  { label: 'Hàng khô & Gia vị' },
  { label: 'Thực phẩm đông lạnh' },
  { label: 'Đồ uống' },
];

const SLIDES = [
  {
    gradient: 'from-emerald-900 via-emerald-800 to-emerald-700',
    badge: 'Giảm đến 30%',
    title: 'Rau củ quả sạch',
    sub: 'VietGAP — thu hoạch và giao hàng trong ngày',
    cta: 'Mua ngay',
    href: '/',
  },
  {
    gradient: 'from-cyan-900 via-cyan-800 to-cyan-600',
    badge: 'Mới về hôm nay',
    title: 'Trái cây tươi nhập khẩu',
    sub: 'Nguồn gốc rõ ràng — kiểm định chất lượng',
    cta: 'Khám phá',
    href: '/',
  },
  {
    gradient: 'from-teal-900 via-teal-800 to-teal-700',
    badge: 'Tiết kiệm 20%',
    title: 'Combo Gia Đình',
    sub: 'Tiết kiệm hơn khi mua combo — nhận tại Hub gần nhà',
    cta: 'Xem combo',
    href: '/',
  },
];

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '#' },
  { label: 'Sản phẩm', href: '/' },
  { label: 'Cẩm nang', href: '#' },
  { label: 'Liên hệ', href: '#' },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="grid grid-cols-12 gap-0 min-h-[320px]">
      {/* LEFT: Sidebar categories */}
      <aside className="hidden lg:flex col-span-3 flex-col bg-white border border-gray-200 rounded-l-xl overflow-hidden">
        <div className="bg-emerald-700 px-4 py-3 flex items-center gap-2 shrink-0">
          <Menu className="h-4 w-4 text-white" />
          <span className="text-white font-bold text-sm tracking-wide">Danh mục sản phẩm</span>
        </div>
        <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
          {SIDEBAR_CATS.map(cat => (
            <li key={cat.label}>
              <Link
                href={`/?search=${encodeURIComponent(cat.label)}`}
                className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
              >
                <span>{cat.label}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 text-emerald-500 transition-opacity shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* RIGHT: Nav + Banner */}
      <div className="col-span-12 lg:col-span-9 flex flex-col">
        {/* Sub-nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white border border-gray-200 border-l-0 px-4 h-10 shrink-0">
          {NAV_LINKS.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                i === 0
                  ? 'text-emerald-700 font-semibold bg-emerald-50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Banner carousel */}
        <div className="relative flex-1 overflow-hidden rounded-r-xl lg:rounded-tr-xl lg:rounded-br-xl rounded-b-xl lg:rounded-bl-none">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-gradient-to-br ${s.gradient} transition-opacity duration-700 ${
                i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="h-full flex items-center px-10 md:px-14">
                <div className="text-white max-w-lg">
                  <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {s.badge}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{s.title}</h2>
                  <p className="text-white/75 text-sm mb-6">{s.sub}</p>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-emerald-50 transition-colors"
                  >
                    {s.cta} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Arrows */}
          <button
            onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-colors z-10"
            aria-label="Trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-colors z-10"
            aria-label="Sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
