import Link from 'next/link';
import Image from 'next/image';

const BANNER_IMAGES: Record<string, string> = {
  farm: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85&auto=format&fit=crop',
  fresh: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=85&auto=format&fit=crop',
  market: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=85&auto=format&fit=crop',
};

interface InterBannerProps {
  badge?: string;
  title: string;
  sub: string;
  cta?: string;
  href?: string;
  gradient?: string;
  imageKey?: keyof typeof BANNER_IMAGES;
}

export function InterBanner({
  badge,
  title,
  sub,
  cta = 'Xem ngay',
  href = '/',
  gradient,
  imageKey,
}: InterBannerProps) {
  const imageUrl = imageKey
    ? BANNER_IMAGES[imageKey]
    : gradient?.includes('emerald')
      ? BANNER_IMAGES.farm
      : BANNER_IMAGES.fresh;

  return (
    <div className="my-4 rounded-2xl overflow-hidden">
      <div className="relative grid md:grid-cols-2 min-h-[220px]">
        {/* Text side */}
        <div
          className="relative z-10 flex flex-col justify-center px-8 md:px-12 py-10 md:py-12"
          style={{ background: 'oklch(0.18 0.038 192)' }}
        >
          {badge && (
            <span
              className="inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-[0.15em] w-fit"
              style={{ background: 'oklch(0.57 0.135 196/0.25)', color: 'oklch(0.80 0.08 196)' }}
            >
              {badge}
            </span>
          )}
          <h3 className="font-editorial font-black text-white leading-tight mb-3"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}
          >
            {title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">{sub}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-full text-sm w-fit transition-all duration-200 hover:gap-3"
            style={{
              background: 'oklch(0.57 0.135 196)',
              color: 'white',
            }}
          >
            {cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Photo side */}
        <div className="relative hidden md:block min-h-[220px]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.18_0.038_192)] to-transparent" />
        </div>
      </div>
    </div>
  );
}
