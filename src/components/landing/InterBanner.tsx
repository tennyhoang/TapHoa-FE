import Link from 'next/link';

interface InterBannerProps {
  badge?: string;
  title: string;
  sub: string;
  cta?: string;
  href?: string;
  gradient?: string;
}

export function InterBanner({
  badge,
  title,
  sub,
  cta = 'Xem ngay',
  href = '/',
  gradient = 'from-emerald-800 to-cyan-600',
}: InterBannerProps) {
  return (
    <div className={`rounded-xl overflow-hidden bg-gradient-to-r ${gradient} my-2`}>
      <div className="px-8 py-10">
        <div className="text-white max-w-xl">
          {badge && (
            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
              {badge}
            </span>
          )}
          <h3 className="text-2xl md:text-3xl font-black mb-2 leading-tight">{title}</h3>
          <p className="text-white/75 text-sm mb-5">{sub}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 bg-white text-emerald-800 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-emerald-50 transition-colors"
          >
            {cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
