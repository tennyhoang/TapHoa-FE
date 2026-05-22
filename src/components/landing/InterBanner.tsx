import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface InterBannerProps {
  href?: string;
  imageUrl?: string;
  /* fallback gradient mode */
  badge?: string;
  title?: string;
  sub?: string;
  cta?: string;
  gradient?: string;
  emoji?: string;
}

export function InterBanner({
  href = '/',
  imageUrl,
  badge,
  title,
  sub,
  cta = 'Xem ngay',
  gradient = 'from-blue-800 to-cyan-600',
  emoji = '🛒',
}: InterBannerProps) {
  if (imageUrl) {
    return (
      <Link href={href}>
        <div className="relative w-full rounded-xl overflow-hidden my-2" style={{ aspectRatio: '4/1' }}>
          <Image
            src={imageUrl}
            alt={title ?? 'Banner'}
            fill
            className="object-cover hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      </Link>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gradient-to-r ${gradient} my-2`}>
      <div className="flex items-center justify-between px-8 py-8">
        <div className="text-white z-10">
          {badge && (
            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
              {badge}
            </span>
          )}
          {title && <h3 className="text-2xl md:text-3xl font-black mb-2 leading-tight">{title}</h3>}
          {sub && <p className="text-white/75 text-sm mb-5">{sub}</p>}
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 bg-white text-blue-800 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-blue-50 transition-colors"
          >
            {cta} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <span className="hidden sm:block text-[90px] opacity-90 shrink-0 select-none">{emoji}</span>
      </div>
    </div>
  );
}
