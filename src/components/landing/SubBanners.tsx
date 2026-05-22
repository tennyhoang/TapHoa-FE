import Link from 'next/link';
import Image from 'next/image';

interface SubBannerItem {
  href: string;
  imageUrl?: string;
  /* fallback gradient */
  bg?: string;
  badge?: string;
  title?: string;
  sub?: string;
  emoji?: string;
}

const BANNERS: SubBannerItem[] = [
  {
    href: '/',
    imageUrl: 'https://res.cloudinary.com/doy14nwx0/image/upload/v1779423079/Screenshot_2026-05-22_111056_qcn3l4.png',
    title: 'Rau củ Đà Lạt',
  },
  {
    href: '/',
    imageUrl: 'https://res.cloudinary.com/doy14nwx0/image/upload/v1779422898/Screenshot_2026-05-22_110728_kvqurx.png',
    title: 'Thực phẩm tươi sống',
  },
];

export function SubBanners() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {BANNERS.map((b, i) => (
        <Link key={i} href={b.href}>
          {b.imageUrl ? (
            <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '3/1' }}>
              <Image
                src={b.imageUrl}
                alt={b.title ?? 'Banner'}
                fill
                className="object-cover hover:scale-[1.02] transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div
              className={`relative h-32 rounded-xl overflow-hidden bg-gradient-to-r ${b.bg} flex items-center px-6 hover:opacity-95 transition-opacity`}
            >
              <div className="text-white z-10">
                {b.badge && <p className="text-xs font-semibold opacity-80 mb-1">{b.badge}</p>}
                {b.title && <p className="font-black text-xl leading-tight">{b.title}</p>}
                {b.sub && <p className="text-xs opacity-80 mt-0.5">{b.sub}</p>}
              </div>
              <span className="absolute right-5 text-7xl opacity-75 select-none">{b.emoji}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
