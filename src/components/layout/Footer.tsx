'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

const HUBS = [
  { name: 'Hub Quận 1', address: 'Kho Tổng Quận 1, TP.HCM' },
  { name: 'Hub Quận 7', address: 'Phú Mỹ Hưng, Quận 7, TP.HCM' },
  { name: 'Hub Bình Thạnh', address: 'Bình Thạnh, TP.HCM' },
  { name: 'Hub Thủ Đức', address: 'TP. Thủ Đức, TP.HCM' },
];

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-stone-900 text-stone-400 mt-16">
      {/* Newsletter */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-lg">Nhận ưu đãi độc quyền</p>
            <p className="text-stone-400 text-sm">Đăng ký email để nhận tin khuyến mãi mới nhất từ TapHoa</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              required
              className="flex-1 sm:w-64 px-4 py-2.5 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shrink-0"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1: Company */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-black text-base shrink-0">T</div>
              <span className="text-white text-lg font-black">TapHoa</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng tạp hóa online uy tín — hàng nghìn sản phẩm chất lượng, giao tận hub gần nhà bạn.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-orange-400 text-xs font-semibold">MST:</span>
                <span>0123456789</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <span>123 Nguyễn Văn Cừ, Q.1, TP. HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                <span>support@taphoa.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                <span>1800 6868</span>
              </li>
            </ul>
          </div>

          {/* Col 2: Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Trang chủ', href: '/' },
                { label: 'Giới thiệu', href: '/gioi-thieu' },
                { label: 'Sản phẩm', href: '/products' },
                { label: 'Hàng mới về', href: '/products?isNew=true' },
                { label: 'Giá tốt mỗi ngày', href: '/products?isDiscount=true' },
                { label: 'Giỏ hàng', href: '/cart' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-orange-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Policy */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Chính sách</h3>
            <ul className="space-y-2 text-sm">
              {[
                'Chính sách đổi trả',
                'Chính sách bảo mật',
                'Chính sách vận chuyển',
                'Điều khoản sử dụng',
                'Hỗ trợ khách hàng',
                'Câu hỏi thường gặp',
              ].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-orange-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Hub map + Payment */}
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Hệ thống Hub nhận hàng</h3>
              <ul className="space-y-2">
                {HUBS.map(hub => (
                  <li key={hub.name} className="flex items-start gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-stone-300 font-medium">{hub.name}</p>
                      <p className="text-stone-500">{hub.address}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Thanh toán</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: 'VISA', bg: 'bg-emerald-600', text: 'text-white' },
                  { label: 'MB Bank', bg: 'bg-white', text: 'text-emerald-800' },
                  { label: 'MoMo', bg: 'bg-pink-500', text: 'text-white' },
                  { label: 'COD', bg: 'bg-green-600', text: 'text-white' },
                ].map(m => (
                  <span key={m.label} className={`${m.bg} ${m.text} text-xs font-bold px-3 py-1.5 rounded-lg`}>
                    {m.label}
                  </span>
                ))}
              </div>

              <h3 className="text-white font-semibold mb-2 text-sm">Kết nối</h3>
              <div className="flex gap-2">
                {[
                  { icon: 'fb', label: 'Facebook', color: 'hover:bg-emerald-600' },
                  { icon: 'ig', label: 'Instagram', color: 'hover:bg-pink-600' },
                  { icon: 'yt', label: 'Youtube', color: 'hover:bg-red-600' },
                ].map(({ icon, label, color }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className={`w-9 h-9 rounded-lg bg-stone-800 ${color} flex items-center justify-center text-stone-400 hover:text-white transition-colors text-xs font-bold uppercase`}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 TapHoa. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-stone-300 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
