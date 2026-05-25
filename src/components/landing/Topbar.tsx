import Link from 'next/link';
import { Leaf, Phone } from 'lucide-react';

export function Topbar() {
  return (
    <div className="bg-[oklch(0.22_0.045_185)] text-[oklch(0.85_0.04_185)] text-xs">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-3 w-3 text-[oklch(0.72_0.14_145)]" />
          <span>
            Rau củ <strong className="text-white font-semibold">VietGAP</strong> — thu hoạch và giao hàng trong ngày
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a href="tel:18006868" className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="h-3 w-3" />
            <span>Hotline: <strong className="text-white">1800 6868</strong></span>
          </a>
          <Link
            href="/cam-nang"
            className="hidden md:block hover:text-white transition-colors"
          >
            Cẩm nang ẩm thực
          </Link>
          <Link
            href="/gioi-thieu"
            className="hover:text-white transition-colors"
          >
            Về TapHoa
          </Link>
        </div>
      </div>
    </div>
  );
}
