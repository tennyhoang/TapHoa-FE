'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SIDEBAR_CATS = [
  { icon: '🥬', label: 'Rau củ quả' },
  { icon: '🍎', label: 'Trái cây tươi' },
  { icon: '🥩', label: 'Thịt & Cá tươi' },
  { icon: '🥚', label: 'Trứng & Sữa' },
  { icon: '🌾', label: 'Gạo & Ngũ cốc' },
  { icon: '🥫', label: 'Hàng khô & Gia vị' },
  { icon: '🧃', label: 'Đồ uống' },
  { icon: '🍜', label: 'Thực phẩm chế biến' },
];

const SLIDES = [
  {
    gradient: 'from-orange-800 via-orange-700 to-amber-600',
    badge: 'Rau sạch VietGAP',
    title: 'Rau củ tươi mỗi ngày',
    sub: 'Thu hoạch buổi sáng — giao tận tay buổi chiều',
    cta: 'Mua ngay',
    href: '/products',
    emoji: '🥬',
  },
  {
    gradient: 'from-amber-700 via-orange-600 to-yellow-500',
    badge: 'Giảm đến 25%',
    title: 'Trái cây tươi ngon',
    sub: 'Trái cây nhiệt đới & nhập khẩu — chất lượng đảm bảo',
    cta: 'Khám phá',
    href: '/products?isDiscount=true',
    emoji: '🍎',
  },
  {
    gradient: 'from-orange-900 via-orange-700 to-amber-600',
    badge: 'Tiết kiệm mỗi ngày',
    title: 'Tạp hóa sạch TapHoa',
    sub: 'Hàng nghìn sản phẩm — giá tốt — giao tận hub gần nhà',
    cta: 'Xem tất cả',
    href: '/products',
    emoji: '🛒',
  },
];

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Cẩm nang', href: '#' },
  { label: 'Liên hệ', href: '#' },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-0 min-h-[340px]">
      {/* Sidebar */}
      <aside className="hidden lg:flex col-span-3 flex-col bg-white border border-orange-100 rounded-l-xl overflow-hidden">
        <div className="bg-orange-600 px-4 py-3 shrink-0">
          <span className="text-white font-bold text-sm tracking-wide">☰ Danh mục sản phẩm</span>
        </div>

        <ul className="flex-1 divide-y divide-orange-50 overflow-y-auto">
          {SIDEBAR_CATS.map(cat => (
            <li key={cat.label}>
              <Link
                href={`/products?search=${encodeURIComponent(cat.label)}`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
              >
                <span className="text-lg shrink-0">{cat.icon}</span>
                <span className="flex-1">{cat.label}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-orange-400 transition-opacity shrink-0" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Hub progress widget */}
        <div className="bg-orange-50 border-t border-orange-100 px-4 py-3 shrink-0">
          <p className="text-[10px] font-bold text-orange-700 mb-2 flex items-center gap-1">
            🚚 Tiến độ gom đơn hôm nay
          </p>
          <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: '75%' }} />
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-orange-600 font-semibold">75% đơn đã gom</span>
            <span className="text-[10px] text-stone-500">Còn ~2 tiếng</span>
          </div>
          <p className="text-[9px] text-stone-400 leading-tight">Kịp chuyến xe 12h đêm về Hub! 🌙</p>
        </div>
      </aside>

      {/* Right: nav + carousel */}
      <div className="col-span-12 lg:col-span-9 flex flex-col">
        <nav className="hidden lg:flex items-center gap-1 bg-white border border-orange-100 border-l-0 px-4 h-10 shrink-0">
          {NAV_LINKS.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                i === 0
                  ? 'text-orange-600 font-semibold bg-orange-50'
                  : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex-1 overflow-hidden rounded-b-xl lg:rounded-bl-none lg:rounded-tr-xl lg:rounded-br-xl">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-gradient-to-br ${s.gradient} transition-opacity duration-700 ${
                i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="h-full flex items-center px-10 md:px-14 gap-6">
                <div className="flex-1 text-white">
                  <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {s.badge}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{s.title}</h2>
                  <p className="text-white/80 text-sm mb-6">{s.sub}</p>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-orange-50 transition-colors shadow-sm"
                  >
                    {s.cta} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <span className="hidden md:block text-[100px] opacity-90 shrink-0 select-none">{s.emoji}</span>
              </div>
            </div>
          ))}

          <button
            onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-sm transition-colors z-10"
            aria-label="Trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-sm transition-colors z-10"
            aria-label="Sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

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
