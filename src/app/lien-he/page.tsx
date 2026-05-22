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
  },
  {
    icon: Phone,
    label: 'Hotline',
    value: '1800 6868',
    sub: 'Miễn phí · 8:00–21:00 hàng ngày',
    href: 'tel:18006868',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@taphoa.vn',
    sub: 'Phản hồi trong 24 giờ',
    href: 'mailto:support@taphoa.vn',
  },
  {
    icon: Clock,
    label: 'Giờ làm việc',
    value: '8:00 – 21:00',
    sub: 'Thứ 2 – Chủ Nhật',
    href: undefined,
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">

      {/* Hero */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-orange-100">
          Liên hệ
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Chúng tôi luôn <span className="text-orange-600">sẵn sàng hỗ trợ</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Có câu hỏi hay cần hỗ trợ? Hãy liên hệ với đội ngũ TapHoa — chúng tôi phản hồi nhanh nhất có thể.
        </p>
      </section>

      {/* Contact info cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONTACT_INFO.map(item => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="text-sm font-bold text-orange-600 hover:underline mt-0.5 block">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
              )}
              {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Contact form + FAQ */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-black text-gray-800">Gửi tin nhắn cho chúng tôi</h2>

          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <p className="font-semibold text-gray-800">Tin nhắn đã được gửi!</p>
              <p className="text-sm text-gray-500">Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.</p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-orange-600 hover:underline font-medium"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Họ tên *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0912..."
                    className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Nội dung *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={4}
                  placeholder="Hãy mô tả vấn đề hoặc câu hỏi của bạn..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Send className="h-4 w-4" />
                Gửi tin nhắn
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-800">Câu hỏi thường gặp</h2>
          <div className="space-y-3">
            {FAQ.map(item => (
              <details key={item.q} className="bg-white rounded-xl border border-gray-100 shadow-sm group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-sm text-gray-800 hover:text-orange-600 transition-colors list-none">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg leading-none shrink-0">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
