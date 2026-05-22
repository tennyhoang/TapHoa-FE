import Link from 'next/link';

const BANNERS = [
  {
    bg: 'from-green-600 to-emerald-500',
    badge: 'Rau sạch VietGAP',
    title: 'Rau củ Đà Lạt',
    sub: 'Thu hoạch mỗi sáng — tươi ngon cả ngày',
    emoji: '🥬',
    href: '/',
  },
  {
    bg: 'from-orange-500 to-amber-400',
    badge: 'Giảm đến 20%',
    title: 'Trái cây tươi ngon',
    sub: 'Xoài, cam, bưởi — giá tốt mỗi ngày',
    emoji: '🍊',
    href: '/?isDiscount=true',
  },
];

export function SubBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {BANNERS.map(b => (
        <Link key={b.title} href={b.href}>
          <div
            className={`relative h-28 rounded-xl overflow-hidden bg-gradient-to-r ${b.bg} flex items-center px-6 hover:opacity-95 transition-opacity`}
          >
            <div className="text-white z-10">
              <p className="text-xs font-semibold opacity-80 mb-1">{b.badge}</p>
              <p className="font-black text-xl leading-tight">{b.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{b.sub}</p>
            </div>
            <span className="absolute right-5 text-7xl opacity-75 select-none">{b.emoji}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
