import Link from 'next/link';
import Image from 'next/image';

const BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=700&q=85&auto=format&fit=crop',
    eyebrow: 'Hôm nay giảm 25%',
    title: 'Rau củ VietGAP',
    sub: 'Tươi sạch, giá tốt',
    href: '/products?search=rau+c%E1%BB%A7',
    badge: '-25%',
  },
  {
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=700&q=85&auto=format&fit=crop',
    eyebrow: 'Mới về hôm nay',
    title: 'Trái cây nhập khẩu',
    sub: 'Nguồn gốc rõ ràng',
    href: '/products?search=tr%C3%A1i+c%C3%A2y',
    badge: 'New',
  },
];

export function SubBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {BANNERS.map(b => (
        <Link key={b.title} href={b.href} className="group block">
          <div className="relative h-32 sm:h-36 rounded-2xl overflow-hidden">
            <Image
              src={b.image}
              alt={b.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.025_195/0.80)] to-[oklch(0.12_0.025_195/0.20)]" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-6 gap-4">
              <div className="text-white">
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1">
                  {b.eyebrow}
                </p>
                <p className="font-editorial font-black text-xl leading-tight mb-0.5">{b.title}</p>
                <p className="text-xs text-white/65">{b.sub}</p>
              </div>
              <div className="ml-auto shrink-0">
                <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {b.badge}
                </span>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
