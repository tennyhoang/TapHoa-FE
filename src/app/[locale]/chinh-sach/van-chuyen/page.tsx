import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách vận chuyển',
  description:
    'Chính sách vận chuyển của TapHoa — thời gian giao hàng, phí vận chuyển, Hub nhận hàng và các quy định liên quan.',
  openGraph: {
    title: 'Chính sách vận chuyển | TapHoa',
    description:
      'Chính sách vận chuyển của TapHoa — thời gian giao hàng, phí vận chuyển, Hub nhận hàng và các quy định liên quan.',
  },
};

const SECTIONS = [
  {
    title: '1. Phương thức vận chuyển',
    body: `TapHoa vận hành mô hình O2O (Online-to-Offline) với hệ thống Hub nhận hàng:

• Hàng được giao từ kho trung tâm đến Hub gần nhất theo địa chỉ của bạn
• Bạn nhận hàng trực tiếp tại Hub hoặc chọn giao tận nơi (tùy khu vực)
• Thời gian mở cửa Hub: 7:00 – 20:00 hàng ngày, kể cả ngày lễ`,
  },
  {
    title: '2. Thời gian giao hàng',
    body: `Thời gian giao hàng ước tính:

• Nội thành Hà Nội & TP. HCM: 12-24 giờ sau khi đặt hàng
• Khu vực ngoại thành: 24-48 giờ sau khi đặt hàng
• Các tỉnh thành khác: 2-4 ngày làm việc

Thời gian trên chỉ là ước tính, có thể thay đổi tùy theo tình trạng tồn kho và điều kiện vận chuyển.`,
  },
  {
    title: '3. Phí vận chuyển',
    body: `• Miễn phí vận chuyển cho đơn hàng từ 200.000₫
• Đơn hàng dưới 200.000₫: phí 15.000₫ - 30.000₫ tùy khu vực
• Phí được tính rõ tại trang thanh toán trước khi xác nhận đơn hàng
• Không có phí phát sinh ngoài phí đã thông báo`,
  },
  {
    title: '4. Hub nhận hàng',
    body: `• Sau khi hàng về Hub, bạn sẽ nhận thông báo qua ứng dụng và SMS
• Hàng được lưu tại Hub trong 48 giờ kể từ khi nhận thông báo
• Quá thời gian trên, TapHoa có thể thu phí lưu kho hoặc hủy đơn hàng
• Khi đến nhận hàng, vui lòng xuất trình mã đơn hàng hoặc CMND`,
  },
  {
    title: '5. Kiểm tra hàng khi nhận',
    body: `• Bạn có quyền kiểm tra sản phẩm tại Hub trước khi nhận
• Nếu phát hiện sản phẩm hư hỏng hoặc sai thông tin, từ chối nhận ngay
• Sau khi xác nhận đã nhận hàng, vui lòng giữ lại hóa đơn để được hỗ trợ đổi trả`,
  },
];

export default function VanChuyenPage() {
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
          Chính sách
        </span>
        <h1
          className="font-editorial font-black text-foreground leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          Chính sách vận chuyển
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
