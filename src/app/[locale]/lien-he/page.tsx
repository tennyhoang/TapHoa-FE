'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Địa chỉ',
    value: '123 Nguyễn Văn Cừ, Quận 1, TP. Hồ Chí Minh',
    href: undefined,
    color: 'oklch(0.54 0.158 145)',
    bg: 'oklch(0.94 0.055 145)',
  },
  {
    icon: Phone,
    label: 'Hotline',
    value: '1800 6868',
    sub: 'Miễn phí · 8:00–21:00 hàng ngày',
    href: 'tel:18006868',
    color: 'oklch(0.57 0.135 196)',
    bg: 'oklch(0.94 0.055 196)',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@taphoa.vn',
    sub: 'Phản hồi trong 24 giờ',
    href: 'mailto:support@taphoa.vn',
    color: 'oklch(0.75 0.155 55)',
    bg: 'oklch(0.96 0.055 85)',
  },
  {
    icon: Clock,
    label: 'Giờ làm việc',
    value: '8:00 – 21:00',
    sub: 'Thứ 2 – Chủ Nhật',
    href: undefined,
    color: 'oklch(0.55 0.15 280)',
    bg: 'oklch(0.94 0.045 280)',
  },
];

const FAQ = [
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
    a: 'TapHoa hỗ trợ chuyển khoản ngân hàng (xác nhận tự động qua SePay) và thanh toán tiền mặt tại Hub (COD).',
  },
  {
    q: 'Tôi quên mật khẩu, làm thế nào?',
    a: 'Hiện tại bạn có thể liên hệ bộ phận hỗ trợ qua hotline hoặc email để được reset mật khẩu. Chức năng tự reset sẽ sớm ra mắt.',
  },
  {
    q: 'Hub nhận hàng hoạt động theo giờ nào?',
    a: 'Các Hub hoạt động từ 7:00–20:00 hàng ngày, kể cả ngày lễ. Bạn có thể đến lấy hàng bất cứ lúc nào trong khung giờ này.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    toast.success('Đã gửi tin nhắn! Chúng tôi sẽ phản hồi trong 24 giờ.');
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  const inputClass =
    'w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all text-foreground placeholder-muted-foreground';

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-3">
        <span
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border"
          style={{
            background: 'oklch(0.94 0.055 196)',
            color: 'oklch(0.40 0.12 196)',
            borderColor: 'oklch(0.85 0.08 196)',
          }}
        >
          Liên hệ
        </span>
        <h1
          className="font-editorial font-black text-foreground leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
        >
          Chúng tôi luôn sẵn sàng hỗ trợ
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Có câu hỏi hay cần hỗ trợ? Đội ngũ TapHoa luôn ở đây và sẽ phản hồi nhanh nhất có thể.
        </p>
      </section>

      {/* Contact info */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONTACT_INFO.map(item => (
          <div
            key={item.label}
            className="bg-card rounded-2xl border border-border/60 p-5 space-y-3 hover:border-border hover:shadow-sm transition-all"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: item.bg }}
            >
              <item.icon className="h-5 w-5" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm font-bold text-primary hover:underline mt-0.5 block"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
              )}
              {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Form + FAQ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-card rounded-2xl border border-border/60 p-7">
          <h2 className="font-editorial font-bold text-xl text-foreground mb-6">Gửi tin nhắn</h2>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'oklch(0.94 0.055 145)' }}
              >
                <CheckCircle2 className="h-7 w-7" style={{ color: 'oklch(0.54 0.158 145)' }} />
              </div>
              <p className="font-semibold text-foreground">Tin nhắn đã được gửi!</p>
              <p className="text-sm text-muted-foreground">
                Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Họ tên *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/70">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0912 345 678"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70">Nội dung *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={4}
                  placeholder="Hãy mô tả vấn đề hoặc câu hỏi của bạn..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
              >
                <Send className="h-4 w-4" />
                Gửi tin nhắn
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-editorial font-bold text-xl text-foreground mb-5">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div
                key={item.q}
                className="bg-card rounded-2xl border border-border/60 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span>{item.q}</span>
                  <span
                    className="text-muted-foreground transition-transform duration-200 shrink-0 ml-3"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
