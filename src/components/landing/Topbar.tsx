import Link from 'next/link';

export function Topbar() {
  return (
    <div className="bg-orange-600 text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
        <span>Kho Tổng Quận 1, TP. Hồ Chí Minh</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block">
            Hotline: <strong className="ml-0.5">1800 6868</strong>
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
