import Link from 'next/link';

const BANNERS = [
  {
    bg: 'from-orange-500 to-red-500',
    badge: 'Khuyến mãi đặc biệt',
    title: 'Rau củ VietGAP',
    sub: 'Giảm 25% — hôm nay',
    href: '/products?search=rau+c%E1%BB%A7',
  },
  {
    bg: 'from-emerald-600 to-cyan-500',
    badge: 'Mới về hôm nay',
    title: 'Trái cây nhập khẩu',
    sub: 'Nguồn gốc rõ ràng',
    href: '/products?search=tr%C3%A1i+c%C3%A2y',
  },
];

export function SubBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {BANNERS.map(b => (
        <Link key={b.title} href={b.href}>
          <div
            className={`h-28 rounded-xl overflow-hidden bg-gradient-to-r ${b.bg} flex items-center px-8 hover:opacity-95 transition-opacity`}
          >
            <div className="text-white">
              <p className="text-xs font-semibold opacity-80 mb-1">{b.badge}</p>
              <p className="font-black text-xl leading-tight">{b.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{b.sub}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
