import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách đổi trả',
  description:
    'Chính sách đổi trả và hoàn tiền của TapHoa — điều kiện, thời gian và quy trình đổi trả hàng.',
  openGraph: {
    title: 'Chính sách đổi trả | TapHoa',
    description:
      'Chính sách đổi trả và hoàn tiền của TapHoa — điều kiện, thời gian và quy trình đổi trả hàng.',
  },
};

const SECTIONS = [
  {
    title: '1. Điều kiện đổi trả',
    body: `Sản phẩm được chấp nhận đổi trả khi đáp ứng đủ các điều kiện sau:

• Sản phẩm bị lỗi từ nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển
• Sản phẩm không đúng chủng loại, số lượng hoặc thông tin như đã đặt hàng
• Sản phẩm hết hạn sử dụng hoặc gần hết hạn không được thông báo trước
• Thông báo đổi trả trong vòng 24 giờ kể từ khi nhận hàng tại Hub`,
  },
  {
    title: '2. Thời gian đổi trả',
    body: `• Thời gian tiếp nhận yêu cầu: trong vòng 24 giờ sau khi nhận hàng
• Thời gian xử lý: 1-3 ngày làm việc kể từ khi nhận được hàng trả lại
• Hoàn tiền qua Ví TapHoa: trong vòng 1-3 ngày làm việc sau khi xác nhận
• Hoàn tiền qua ngân hàng: 3-7 ngày làm việc (tùy thuộc vào ngân hàng)`,
  },
  {
    title: '3. Sản phẩm không được đổi trả',
    body: `Các trường hợp không áp dụng đổi trả:

• Sản phẩm đã qua sử dụng, không còn nguyên đai nguyên kiện
• Sản phẩm là thực phẩm tươi sống đã được sơ chế hoặc cắt nhỏ
• Sản phẩm giảm giá đặc biệt (đã ghi rõ khi mua)
• Sản phẩm đã hết hạn sử dụng do người mua bảo quản không đúng cách`,
  },
  {
    title: '4. Quy trình đổi trả',
    body: `Bước 1: Liên hệ bộ phận hỗ trợ qua ứng dụng TapHoa hoặc hotline 1800 6868
Bước 2: Cung cấp mã đơn hàng và hình ảnh sản phẩm (nếu cần)
Bước 3: Nhận xác nhận và hướng dẫn từ bộ phận hỗ trợ
Bước 4: Mang sản phẩm đến Hub đã nhận hàng kèm mã xác nhận
Bước 5: Nhận hoàn tiền hoặc sản phẩm thay thế`,
  },
  {
    title: '5. Hoàn tiền',
    body: `• Hoàn tiền được thực hiện sau khi TapHoa xác nhận đã nhận lại sản phẩm
• Hình thức hoàn tiền: Ví TapHoa (mặc định) hoặc chuyển khoản ngân hàng
• Số tiền hoàn = giá trị đơn hàng - phí vận chuyển (nếu đã phát sinh)
• Voucher và mã giảm giá đã sử dụng sẽ không được hoàn lại`,
  },
];

export default function DoiTraPage() {
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
          Chính sách đổi trả
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
