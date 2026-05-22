import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';

export function Topbar() {
  return (
    <div className="bg-orange-600 text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-orange-200 shrink-0" />
          <span>Kho Tổng Quận 1, TP. Hồ Chí Minh</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-orange-200 shrink-0" />
            Hotline: <strong className="text-white ml-0.5">1800 6868</strong>
          </span>
          <Link
            href="/"
            className="bg-orange-700 hover:bg-orange-800 text-white px-3 py-0.5 rounded-full transition-colors font-medium"
          >
            Hệ thống kho TapHoa
          </Link>
        </div>
      </div>
    </div>
  );
}
