import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description:
    'Điều khoản sử dụng của TapHoa — quy định về tài khoản, đặt hàng, thanh toán, giao hàng, hoàn trả và trách nhiệm pháp lý.',
  openGraph: {
    title: 'Điều khoản sử dụng | TapHoa',
    description:
      'Điều khoản sử dụng của TapHoa — quy định về tài khoản, đặt hàng, thanh toán, giao hàng, hoàn trả và trách nhiệm pháp lý.',
  },
};

const SECTIONS = [
  {
    title: '1. Điều khoản sử dụng',
    body: `Bằng cách sử dụng ứng dụng TapHoa, bạn đồng ý tuân thủ các điều khoản này. TapHoa là nền tảng thương mại điện tử thực phẩm tươi sống kết nối người mua và hệ thống Hub giao nhận.`,
  },
  {
    title: '2. Tài khoản người dùng',
    body: `• Bạn phải đủ 18 tuổi để tạo tài khoản
• Thông tin đăng ký phải chính xác và đầy đủ
• Bạn chịu trách nhiệm bảo mật mật khẩu
• Không được chia sẻ hoặc chuyển nhượng tài khoản
• TapHoa có quyền khóa tài khoản vi phạm`,
  },
  {
    title: '3. Đặt hàng và thanh toán',
    body: `• Đơn hàng được xác nhận sau khi thanh toán thành công
• Giá sản phẩm có thể thay đổi theo thời gian thực
• Voucher chỉ áp dụng theo điều kiện ghi rõ
• TapHoa không chịu trách nhiệm về sai lệch thông tin từ nhà cung cấp`,
  },
  {
    title: '4. Giao hàng',
    body: `• Hàng được giao đến Hub gần nhất theo địa chỉ đã chọn
• Thời gian giao hàng là ước tính, có thể thay đổi
• Khách hàng cần lấy hàng trong thời gian quy định
• TapHoa không chịu trách nhiệm nếu khách không đến lấy đúng hạn`,
  },
  {
    title: '5. Hoàn trả và hoàn tiền',
    body: `• Được hoàn trả trong vòng 24h kể từ khi nhận hàng nếu sản phẩm lỗi
• Hoàn tiền qua Ví TapHoa trong 1-3 ngày làm việc
• Không chấp nhận hoàn trả sản phẩm đã sử dụng
• Liên hệ hỗ trợ qua ứng dụng để tạo yêu cầu hoàn trả`,
  },
  {
    title: '6. Giới hạn trách nhiệm',
    body: `TapHoa không chịu trách nhiệm về:

• Thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ
• Sự cố kỹ thuật ngoài tầm kiểm soát
• Thông tin không chính xác từ bên thứ ba`,
  },
  {
    title: '7. Điều khoản thay đổi',
    body: `TapHoa có quyền sửa đổi điều khoản bất kỳ lúc nào. Thay đổi sẽ được thông báo qua ứng dụng và có hiệu lực sau 7 ngày.

Mọi thắc mắc: legal@taphoa.vn`,
  },
];

export default function DieuKhoanPage() {
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
          Điều khoản sử dụng
        </h1>
        <p className="text-sm text-muted-foreground">Có hiệu lực từ: 01/01/2024</p>
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
