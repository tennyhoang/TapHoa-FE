import Link from 'next/link';

const BANNERS = [
  {
    bg: 'from-orange-500 to-red-500',
    badge: 'Khuyến mãi đặc biệt',
    title: 'Tôm Sú Tươi',
    sub: 'Giảm 25% hôm nay',
    emoji: '🦐',
    href: '/?search=t%C3%B4m+s%C3%BA',
  },
  {
    bg: 'from-blue-600 to-cyan-500',
    badge: 'Mới về hôm nay',
    title: 'Cá Hồi Na Uy',
    sub: 'Nhập khẩu trực tiếp',
    emoji: '🐟',
    href: '/?search=c%C3%A1+h%E1%BB%93i',
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
