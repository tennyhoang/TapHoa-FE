'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const HUBS = [
  { name: 'Hub Quận 1', address: '12 Lý Tự Trọng, Quận 1, TP.HCM' },
  { name: 'Hub Bình Thạnh', address: '45 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM' },
  { name: 'Hub Hoàn Kiếm', address: '8 Hàng Bài, Hoàn Kiếm, Hà Nội' },
];

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Đăng ký thành công! Ưu đãi sẽ gửi đến email của bạn.');
    setEmail('');
  };

  return (
    <footer style={{ background: 'oklch(0.13 0.022 188)', color: 'oklch(0.62 0.03 192)' }}>

      {/* Newsletter strip */}
      <div style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'oklch(0.57 0.135 196/0.20)' }}
            >
              <Leaf className="h-5 w-5" style={{ color: 'oklch(0.72 0.13 196)' }} />
            </div>
            <div>
              <p className="text-white font-editorial font-bold text-lg leading-tight">Nhận ưu đãi mỗi tuần</p>
              <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.028 192)' }}>
                Thực đơn gợi ý, mẹo chọn thực phẩm tươi và khuyến mãi sớm nhất
              </p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto shrink-0">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email của bạn..."
              required
              className="flex-1 md:w-60 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'oklch(1 0 0 / 0.07)',
                border: '1px solid oklch(1 0 0 / 0.12)',
              }}
            />
            <button
              type="submit"
              className="text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0"
              style={{ background: 'oklch(0.57 0.135 196)' }}
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'oklch(0.57 0.135 196)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="text-white font-editorial font-black text-xl">TapHoa</span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.52 0.025 192)' }}>
              Nền tảng thực phẩm tươi sạch — rau củ VietGAP, trái cây nhập khẩu, thịt cá tươi ngon, nhận tại Hub gần nhà bạn.
            </p>

            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'oklch(0.68 0.13 196)' }} />
                <span>123 Nguyễn Văn Cừ, Quận 1, TP. HCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.68 0.13 196)' }} />
                <span>support@taphoa.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" style={{ color: 'oklch(0.68 0.13 196)' }} />
                <span className="text-white font-medium">1800 6868</span>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm tracking-wide">Khám phá</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Trang chủ', href: '/' },
                { label: 'Giới thiệu', href: '/gioi-thieu' },
                { label: 'Tất cả sản phẩm', href: '/products' },
                { label: 'Hàng mới về', href: '/products?isNew=true' },
                { label: 'Giá tốt mỗi ngày', href: '/products?isDiscount=true' },
                { label: 'Cẩm nang ẩm thực', href: '/cam-nang' },
                { label: 'Liên hệ', href: '/lien-he' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm tracking-wide">Chính sách</h3>
            <ul className="space-y-3 text-sm">
              {[
                'Chính sách đổi trả',
                'Chính sách bảo mật',
                'Chính sách vận chuyển',
                'Điều khoản sử dụng',
                'Câu hỏi thường gặp',
              ].map(label => (
                <li key={label}>
                  <Link href="/lien-he" className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hubs + Payment */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm tracking-wide">Hub nhận hàng</h3>
              <ul className="space-y-3">
                {HUBS.map(hub => (
                  <li key={hub.name} className="flex items-start gap-2.5 text-xs">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'oklch(0.68 0.13 196)' }} />
                    <div>
                      <p className="text-white font-medium">{hub.name}</p>
                      <p className="mt-0.5" style={{ color: 'oklch(0.48 0.02 192)' }}>{hub.address}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">Thanh toán</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: 'VietQR', bg: 'oklch(0.57 0.135 196)', text: 'white' },
                  { label: 'MoMo', bg: 'oklch(0.55 0.18 340)', text: 'white' },
                  { label: 'VISA', bg: 'oklch(0.38 0.12 264)', text: 'white' },
                  { label: 'COD', bg: 'oklch(0.52 0.15 145)', text: 'white' },
                ].map(m => (
                  <span
                    key={m.label}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: m.bg, color: m.text }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">Kết nối</h3>
              <div className="flex gap-2">
                {[
                  { label: 'fb', title: 'Facebook' },
                  { label: 'ig', title: 'Instagram' },
                  { label: 'yt', title: 'Youtube' },
                ].map(({ label, title }) => (
                  <a
                    key={title}
                    href="#"
                    aria-label={title}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold uppercase transition-colors hover:text-white"
                    style={{
                      background: 'oklch(1 0 0 / 0.07)',
                      color: 'oklch(0.55 0.025 192)',
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: '1px solid oklch(1 0 0 / 0.08)',
            color: 'oklch(0.42 0.018 192)',
          }}
        >
          <p>© 2026 TapHoa. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-5">
            {['Chính sách bảo mật', 'Điều khoản', 'Hỗ trợ'].map(t => (
              <a key={t} href="#" className="hover:text-white transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
