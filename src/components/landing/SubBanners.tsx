import Link from 'next/link';
import Image from 'next/image';

const BANNERS = [
  {
    image:
      'https://images.unsplash.com/photo-1557844352-761f2565b576?w=700&q=85&auto=format&fit=crop',
    eyebrow: 'Hôm nay giảm 25%',
    title: 'Rau củ VietGAP',
    sub: 'Tươi sạch, giá tốt mỗi ngày',
    href: '/products?categoryName=Rau+c%E1%BB%A7',
    badge: '-25%',
    badgeColor: 'bg-[oklch(0.75_0.155_55)] text-[oklch(0.25_0.05_50)]',
  },
  {
    image:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=700&q=85&auto=format&fit=crop',
    eyebrow: 'Mới về hôm nay',
    title: 'Trái cây nhập khẩu',
    sub: 'Nguồn gốc rõ ràng, an toàn',
    href: '/products?categoryName=Tr%C3%A1i+c%C3%A2y',
    badge: 'Mới',
    badgeColor: 'bg-primary/15 text-primary',
  },
];

export function SubBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {BANNERS.map(b => (
        <Link key={b.title} href={b.href} className="group block">
          <div className="relative h-36 sm:h-44 rounded-2xl overflow-hidden border border-border/60 bg-card hover:border-primary/30 hover:shadow-[0_4px_20px_oklch(0.57_0.135_196/0.10)] transition-all duration-300">
            <Image
              src={b.image}
              alt={b.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {/* Light overlay — left content area stays readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/10" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center px-5 sm:px-6">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-0.5">
                  {b.eyebrow}
                </p>
                <p className="font-editorial font-black text-lg sm:text-xl leading-tight text-foreground mb-1">
                  {b.title}
                </p>
                <p className="text-xs text-muted-foreground mb-2.5 hidden sm:block">{b.sub}</p>
                <span
                  className={`inline-block text-[10px] font-black px-2.5 py-1 rounded-full ${b.badgeColor}`}
                >
                  {b.badge}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
