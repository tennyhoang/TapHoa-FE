import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-black text-base">T</div>
              <span className="text-white text-lg font-black">TapHoa</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng mua sắm online uy tín, mang đến hàng nghìn sản phẩm chất lượng với giá tốt nhất.
            </p>
            <div className="flex gap-2 pt-1">
              {['fb', 'ig', 'yt'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-emerald-600 transition-colors flex items-center justify-center text-xs font-bold uppercase text-gray-300 hover:text-white">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Shopping links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Mua sắm</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Trang chủ</Link></li>
              <li><Link href="/?sortBy=newest" className="hover:text-emerald-400 transition-colors">Hàng mới về</Link></li>
              <li><Link href="/?sortBy=price_asc" className="hover:text-emerald-400 transition-colors">Giá tốt nhất</Link></li>
              <li><Link href="/cart" className="hover:text-emerald-400 transition-colors">Giỏ hàng</Link></li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Tài khoản</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="hover:text-emerald-400 transition-colors">Đăng nhập</Link></li>
              <li><Link href="/auth/register" className="hover:text-emerald-400 transition-colors">Đăng ký</Link></li>
              <li><Link href="/profile/orders" className="hover:text-emerald-400 transition-colors">Đơn hàng của tôi</Link></li>
              <li><Link href="/profile/addresses" className="hover:text-emerald-400 transition-colors">Địa chỉ giao hàng</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>123 Nguyễn Văn Cừ, Q.5, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>1800 6868</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>support@taphoa.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© 2025 TapHoa. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
