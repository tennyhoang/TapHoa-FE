import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp',
  description:
    'Câu hỏi thường gặp về TapHoa — đặt hàng, thanh toán, giao hàng, đổi trả và hỗ trợ khách hàng.',
  openGraph: {
    title: 'Câu hỏi thường gặp | TapHoa',
    description:
      'Câu hỏi thường gặp về TapHoa — đặt hàng, thanh toán, giao hàng, đổi trả và hỗ trợ khách hàng.',
  },
};

const ITEMS = [
  {
    q: 'Đơn hàng giao trong bao lâu?',
    a: 'Thông thường đơn hàng được giao đến Hub trong vòng 24–48 giờ sau khi xác nhận. Bạn sẽ nhận thông báo khi hàng sẵn sàng tại Hub.',
  },
  {
    q: 'Tôi có thể đổi/trả hàng không?',
    a: 'TapHoa hỗ trợ đổi trả trong vòng 24 giờ kể từ khi nhận hàng tại Hub, với điều kiện sản phẩm chưa qua sử dụng và còn nguyên đai nguyên kiện.',
  },
  {
    q: 'Có những phương thức thanh toán nào?',
    a: 'TapHoa hỗ trợ chuyển khoản ngân hàng (xác nhận tự động qua SePay), ví MoMo, thẻ VISA/Mastercard và thanh toán tiền mặt tại Hub (COD).',
  },
  {
    q: 'Hub nhận hàng là gì?',
    a: 'Hub là điểm nhận hàng gần nhà bạn — thay thế cho hình thức giao tận nơi. Bạn đến Hub để lấy hàng đã đặt, giúp giảm chi phí vận chuyển và thời gian chờ đợi.',
  },
  {
    q: 'Tôi quên mật khẩu, làm thế nào?',
    a: 'Hiện tại bạn có thể liên hệ bộ phận hỗ trợ qua hotline 1800 6868 hoặc email support@taphoa.vn để được reset mật khẩu. Chức năng tự reset sẽ sớm ra mắt.',
  },
  {
    q: 'Hub nhận hàng hoạt động theo giờ nào?',
    a: 'Các Hub hoạt động từ 7:00–20:00 hàng ngày, kể cả ngày lễ. Bạn có thể đến lấy hàng bất cứ lúc nào trong khung giờ này.',
  },
  {
    q: 'Làm sao để theo dõi đơn hàng?',
    a: 'Sau khi đặt hàng thành công, bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng" trên ứng dụng hoặc website TapHoa.',
  },
  {
    q: 'Có được hủy đơn hàng không?',
    a: 'Bạn có thể hủy đơn hàng trong vòng 30 phút sau khi đặt. Sau thời gian này, nếu đơn hàng đã được xử lý, vui lòng liên hệ hỗ trợ để được hướng dẫn.',
  },
  {
    q: 'Làm sao để liên hệ hỗ trợ?',
    a: 'Bạn có thể liên hệ qua hotline 1800 6868 (miễn phí, 8:00–21:00 hàng ngày), email support@taphoa.vn hoặc gửi tin nhắn qua trang Liên hệ.',
  },
];

export default function FaqPage() {
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
          Hỗ trợ
        </span>
        <h1
          className="font-editorial font-black text-foreground leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          Câu hỏi thường gặp
        </h1>
        <p className="text-sm text-muted-foreground">
          Những câu hỏi phổ biến nhất về TapHoa
        </p>
      </div>

      <div className="space-y-3">
        {ITEMS.map(item => (
          <details
            key={item.q}
            className="bg-card rounded-2xl border border-border/60 group open:border-border open:shadow-sm transition-all"
          >
            <summary className="flex items-center justify-between px-6 py-4 text-left font-semibold text-sm text-foreground cursor-pointer list-none hover:text-primary transition-colors">
              <span>{item.q}</span>
              <span className="text-muted-foreground shrink-0 ml-3 transition-transform duration-200 group-open:rotate-45 text-lg leading-none">
                +
              </span>
            </summary>
            <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
