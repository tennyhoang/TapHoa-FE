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
    <footer className="text-sm" style={{ background: 'oklch(0.13 0.022 188)', color: 'oklch(0.74 0.02 192)' }}>
      {/* Newsletter strip */}
      <div style={{ borderBottom: '1px solid oklch(1 0 0 / 0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'oklch(0.57 0.135 196/0.20)' }}
            >
              <Leaf className="h-4 w-4" style={{ color: 'oklch(0.72 0.13 196)' }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Nhận ưu đãi mỗi tuần
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(0.65 0.025 192)' }}>
                Thực đơn gợi ý, mẹo chọn thực phẩm tươi và khuyến mãi sớm nhất
              </p>
            </div>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex gap-2 w-full md:w-auto shrink-0"
            role="form"
            aria-label="Đăng ký nhận ưu đãi"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Địa chỉ email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email của bạn..."
              required
              aria-required="true"
              className="flex-1 md:w-56 px-3.5 py-2 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 transition-all"
              style={{
                background: 'oklch(1 0 0 / 0.07)',
                border: '1px solid oklch(1 0 0 / 0.12)',
              }}
            />
            <button
              type="submit"
              aria-label="Đăng ký nhận bản tin"
              className="text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors shrink-0"
              style={{ background: 'oklch(0.57 0.135 196)' }}
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'oklch(0.57 0.135 196)' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
                </svg>
              </div>
              <span className="text-white font-bold text-base">TapHoa</span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.64 0.02 192)' }}>
              Nền tảng thực phẩm tươi sạch — rau củ VietGAP, trái cây nhập khẩu, thịt cá tươi ngon,
              nhận tại Hub gần nhà bạn.
            </p>

            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0 mt-0.5"
                  style={{ color: 'oklch(0.68 0.13 196)' }}
                />
                <span>123 Nguyễn Văn Cừ, Quận 1, TP. HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.68 0.13 196)' }} />
                <span>support@taphoa.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: 'oklch(0.68 0.13 196)' }} />
                <span className="text-white font-medium">1800 6868</span>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs tracking-wide">Khám phá</h3>
            <ul className="space-y-2 text-sm">
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
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs tracking-wide">Chính sách</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Chính sách đổi trả', href: '/chinh-sach/doi-tra' },
                { label: 'Chính sách bảo mật', href: '/chinh-sach/bao-mat' },
                { label: 'Chính sách vận chuyển', href: '/chinh-sach/van-chuyen' },
                { label: 'Điều khoản sử dụng', href: '/dieu-khoan' },
                { label: 'Câu hỏi thường gặp', href: '/faq' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hubs + Payment */}
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-semibold mb-3 text-xs tracking-wide">Hub nhận hàng</h3>
              <ul className="space-y-2">
                {HUBS.map(hub => (
                  <li key={hub.name} className="flex items-start gap-2 text-xs">
                    <MapPin
                      className="h-3 w-3 shrink-0 mt-0.5"
                      style={{ color: 'oklch(0.68 0.13 196)' }}
                    />
                    <div>
                      <p className="text-white font-medium">{hub.name}</p>
                      <p className="mt-0.5" style={{ color: 'oklch(0.60 0.02 192)' }}>
                        {hub.address}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2 text-xs tracking-wide">Thanh toán</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[
                  { label: 'VietQR', bg: 'oklch(0.57 0.135 196)', text: 'white' },
                  { label: 'MoMo', bg: 'oklch(0.55 0.18 340)', text: 'white' },
                  { label: 'VISA', bg: 'oklch(0.38 0.12 264)', text: 'white' },
                  { label: 'COD', bg: 'oklch(0.52 0.15 145)', text: 'white' },
                ].map(m => (
                  <span
                    key={m.label}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: m.bg, color: m.text }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              <h3 className="text-white font-semibold mb-2 text-xs tracking-wide">Kết nối</h3>
              <div className="flex gap-2">
                {[
                  {
                    title: 'Facebook',
                    href: 'https://facebook.com/taphoa.vn',
                    path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
                  },
                  {
                    title: 'Instagram',
                    href: 'https://instagram.com/taphoa.vn',
                    path: 'M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6zm0 2a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8zM12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5-2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
                  },
                  {
                    title: 'Youtube',
                    href: 'https://youtube.com/@taphoa',
                    path: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM10 15.5v-7l6 3.5-6 3.5z',
                  },
                ].map(({ title, href, path }) => (
                  <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={title}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:text-white"
                    style={{
                      background: 'oklch(1 0 0 / 0.07)',
                      color: 'oklch(0.65 0.025 192)',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px]"
          style={{
            borderTop: '1px solid oklch(1 0 0 / 0.08)',
            color: 'oklch(0.55 0.02 192)',
          }}
        >
          <p>© 2026 TapHoa. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            {[
              { label: 'Chính sách bảo mật', href: '/chinh-sach/bao-mat' },
              { label: 'Điều khoản', href: '/dieu-khoan' },
              { label: 'Hỗ trợ', href: '/lien-he' },
            ].map(item => (
              <a key={item.label} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
