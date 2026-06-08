import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-2">
        <p className="text-8xl font-black text-green-600">404</p>
        <h2 className="text-2xl font-bold text-gray-900">Trang không tồn tại</h2>
        <p className="text-gray-500">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Xem sản phẩm
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products?search=">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Link>
        </Button>
      </div>
    </div>
  );
}
