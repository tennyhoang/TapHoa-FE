import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description:
    'Chính sách bảo mật của TapHoa — thông tin thu thập, mục đích sử dụng, chia sẻ dữ liệu và quyền của người dùng.',
  openGraph: {
    title: 'Chính sách bảo mật | TapHoa',
    description:
      'Chính sách bảo mật của TapHoa — thông tin thu thập, mục đích sử dụng, chia sẻ dữ liệu và quyền của người dùng.',
  },
};

const SECTIONS = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    body: `Chúng tôi thu thập các thông tin sau khi bạn sử dụng TapHoa:

• Thông tin tài khoản: họ tên, email, số điện thoại
• Thông tin giao dịch: lịch sử đơn hàng, phương thức thanh toán
• Địa chỉ giao hàng và điểm Hub ưa thích
• Dữ liệu thiết bị: token thông báo, hệ điều hành
• Dữ liệu sử dụng: tìm kiếm, sản phẩm đã xem`,
  },
  {
    title: '2. Mục đích sử dụng',
    body: `Dữ liệu được sử dụng để:

• Xử lý đơn hàng và thanh toán
• Gửi thông báo về trạng thái đơn hàng
• Cải thiện trải nghiệm mua sắm
• Ngăn chặn gian lận và bảo mật tài khoản
• Gửi thông tin khuyến mãi (nếu bạn đồng ý)`,
  },
  {
    title: '3. Chia sẻ dữ liệu',
    body: `Chúng tôi KHÔNG bán dữ liệu cá nhân của bạn. Dữ liệu chỉ được chia sẻ với:

• Đối tác vận chuyển để thực hiện giao hàng
• Cổng thanh toán để xử lý giao dịch
• Cơ quan pháp luật khi có yêu cầu hợp lệ`,
  },
  {
    title: '4. Bảo mật dữ liệu',
    body: `Chúng tôi áp dụng các biện pháp bảo mật:

• Mã hóa dữ liệu truyền tải (HTTPS/TLS)
• Token xác thực lưu trong Secure Store
• Xác thực sinh trắc học cho giao dịch nhạy cảm
• Tự động đăng xuất sau 15 phút không hoạt động`,
  },
  {
    title: '5. Quyền của bạn',
    body: `Bạn có quyền:

• Xem và cập nhật thông tin cá nhân
• Yêu cầu xóa tài khoản và toàn bộ dữ liệu
• Từ chối nhận thông báo marketing
• Xuất dữ liệu cá nhân

Để thực hiện các quyền này, liên hệ: support@taphoa.vn`,
  },
  {
    title: '6. Liên hệ',
    body: `Nếu có thắc mắc về chính sách bảo mật:

Email: privacy@taphoa.vn
Địa chỉ: Hà Nội, Việt Nam

Chính sách này có hiệu lực từ 01/01/2024.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-8 text-center space-y-2">
        <span
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border"
          style={{
            background: 'oklch(0.94 0.055 196)',
            color: 'oklch(0.40 0.12 196)',
            borderColor: 'oklch(0.85 0.08 196)',
          }}
        >
          Pháp lý
        </span>
        <h1
          className="font-editorial font-black text-foreground leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          Chính sách bảo mật
        </h1>
        <p className="text-sm text-muted-foreground">Cập nhật lần cuối: 01/01/2024</p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(sec => (
          <div
            key={sec.title}
            className="bg-card rounded-2xl border border-border/60 p-6 hover:border-border hover:shadow-sm transition-all"
          >
            <h2 className="font-bold text-foreground text-base mb-3">{sec.title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {sec.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
