import Link from 'next/link';
import { Phone } from 'lucide-react';

export function Topbar() {
  return (
    <div className="bg-primary text-primary-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <Phone className="h-3 w-3" />
            Hotline: <strong className="font-bold">1800 6868</strong>
          </div>
          <span className="text-primary-foreground/50 hidden sm:block">|</span>
          <span className="text-primary-foreground/80 hidden sm:block">
            Miễn phí giao hàng đơn từ 300K
          </span>
        </div>
        <div className="flex items-center gap-5 text-primary-foreground/80">
          <Link href="/gioi-thieu" className="hover:text-primary-foreground transition-colors">
            Giới thiệu
          </Link>
          <Link
            href="/lien-he"
            className="hidden md:block hover:text-primary-foreground transition-colors"
          >
            Liên hệ
          </Link>
          <Link
            href="/cam-nang"
            className="hidden md:block hover:text-primary-foreground transition-colors"
          >
            Cẩm nang
          </Link>
        </div>
      </div>
    </div>
  );
}
