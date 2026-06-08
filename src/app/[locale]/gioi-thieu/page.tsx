import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description:
    'TapHoa — nền tảng tạp hóa online kết nối người tiêu dùng với thực phẩm tươi sạch, nhận tại Hub gần nhà.',
  openGraph: {
    title: 'Giới thiệu | TapHoa',
    description:
      'TapHoa — nền tảng tạp hóa online kết nối người tiêu dùng với thực phẩm tươi sạch, nhận tại Hub gần nhà.',
  },
};
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Star,
  Users,
  ShoppingCart,
} from 'lucide-react';

const STATS = [
  { value: '10.000+', label: 'Khách hàng tin dùng', icon: Users },
  { value: '5.000+', label: 'Sản phẩm đa dạng', icon: ShoppingCart },
  { value: '50+', label: 'Điểm Hub nhận hàng', icon: MapPin },
  { value: '99%', label: 'Hài lòng sau mua', icon: Star },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Chất lượng đảm bảo',
    desc: 'Tất cả sản phẩm được kiểm định kỹ trước khi đến tay khách hàng. Cam kết đúng mô tả, đúng xuất xứ.',
    color: 'oklch(0.54 0.158 145)',
    bg: 'oklch(0.94 0.055 145)',
  },
  {
    icon: Truck,
    title: 'Giao hàng nhanh chóng',
    desc: 'Hệ thống Hub phủ rộng, đảm bảo hàng đến tay bạn trong thời gian sớm nhất — đặc biệt với thực phẩm tươi.',
    color: 'oklch(0.57 0.135 196)',
    bg: 'oklch(0.94 0.055 196)',
  },
  {
    icon: Star,
    title: 'Giá cả hợp lý',
    desc: 'Làm việc trực tiếp với nhà cung cấp, cắt giảm trung gian để mang đến mức giá tốt nhất cho bạn.',
    color: 'oklch(0.75 0.155 55)',
    bg: 'oklch(0.96 0.055 85)',
  },
  {
    icon: Users,
    title: 'Phục vụ tận tâm',
    desc: 'Đội ngũ hỗ trợ khách hàng sẵn sàng 7 ngày/tuần, từ 8h đến 21h — luôn ở đây vì bạn.',
    color: 'oklch(0.55 0.15 320)',
    bg: 'oklch(0.95 0.045 320)',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-16">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden" style={{ minHeight: '340px' }}>
        <Image
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=85&auto=format&fit=crop"
          alt="TapHoa fresh market"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.15 0.038 190 / 0.90) 40%, oklch(0.15 0.038 190 / 0.50))',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-[0.15em]"
            style={{
              background: 'oklch(0.57 0.135 196/0.25)',
              color: 'oklch(0.85 0.09 196)',
              border: '1px solid oklch(0.57 0.135 196/0.40)',
            }}
          >
            Về chúng tôi
          </span>
          <h1
            className="font-editorial font-black text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}
          >
            TapHoa — Tạp hóa sạch
            <br />
            ngay tại nhà bạn
          </h1>
          <p className="text-white/65 max-w-xl leading-relaxed text-sm mb-8">
            Nền tảng mua sắm thực phẩm tươi sạch kết nối người tiêu dùng với hàng nghìn sản phẩm
            thiết yếu — giao tận Hub gần nhất.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm transition-all"
              style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
            >
              Mua sắm ngay
            </Link>
            <a
              href="tel:18006868"
              className="inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-full text-sm text-white transition-all"
              style={{ background: 'oklch(1 0 0 / 0.15)', border: '1px solid oklch(1 0 0 / 0.30)' }}
            >
              <Phone className="h-4 w-4" /> Gọi tư vấn
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div
            key={s.label}
            className="bg-card rounded-2xl border border-border/60 p-6 text-center hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="font-editorial font-black text-3xl text-primary mb-1">{s.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="bg-card rounded-3xl border border-border/60 p-8 md:p-12">
        <div className="mb-6">
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.16em]">
            Câu chuyện
          </span>
          <h2 className="font-editorial font-black text-2xl text-foreground mt-1">
            Từ bài toán quen thuộc
          </h2>
        </div>
        <div className="space-y-4 text-muted-foreground leading-relaxed text-sm max-w-2xl">
          <p>
            TapHoa ra đời từ một câu hỏi đơn giản: làm sao để mua thực phẩm hàng ngày tiện lợi hơn,
            tin cậy hơn mà không cần mất hàng giờ ở chợ hay siêu thị?
          </p>
          <p>
            Được khởi động năm 2024, chúng tôi xây dựng nền tảng kết nối người tiêu dùng với hàng
            nghìn sản phẩm thiết yếu từ các nhà cung cấp uy tín. Không chỉ là thương mại điện tử
            thông thường — TapHoa vận hành hệ thống Hub nhận hàng phân tán, rút ngắn thời gian giao
            và giảm chi phí logistics.
          </p>
          <p>
            Mỗi đơn hàng đều được xử lý cẩn thận — đặc biệt với thực phẩm tươi sống: thu hoạch buổi
            sáng, giao tay khách buổi chiều. Chúng tôi tin mỗi gia đình Việt xứng đáng có sản phẩm
            chất lượng, đúng lúc, đúng nơi.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-5">
        <div
          className="rounded-3xl p-8 text-white space-y-3"
          style={{ background: 'oklch(0.18 0.038 192)' }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: 'oklch(0.68 0.13 196)' }}
          >
            Sứ mệnh
          </span>
          <h3 className="font-editorial font-black text-xl text-white">
            Thực phẩm sạch cho mọi nhà
          </h3>
          <p className="leading-relaxed text-sm" style={{ color: 'oklch(0.65 0.04 192)' }}>
            Xây dựng TapHoa thành nền tảng tạp hóa online đáng tin cậy nhất Việt Nam — nơi người
            tiêu dùng mua sắm với sự tiện lợi, minh bạch và an tâm tuyệt đối.
          </p>
        </div>
        <div
          className="rounded-3xl p-8 text-white space-y-3"
          style={{ background: 'oklch(0.22 0.030 192)' }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: 'oklch(0.72 0.14 145)' }}
          >
            Tầm nhìn
          </span>
          <h3 className="font-editorial font-black text-xl text-white">Phủ sóng toàn quốc</h3>
          <p className="leading-relaxed text-sm" style={{ color: 'oklch(0.60 0.035 192)' }}>
            Trong 3 năm tới, TapHoa hướng đến phủ sóng Hub tại toàn bộ tỉnh thành lớn, mở rộng lên
            20.000+ sản phẩm và trở thành người bạn mua sắm của triệu gia đình Việt.
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.18em]">
            Giá trị
          </span>
          <h2 className="font-editorial font-black text-2xl text-foreground mt-1">
            Cam kết với bạn
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {VALUES.map(v => (
            <div
              key={v.title}
              className="bg-card rounded-2xl border border-border/60 p-6 flex gap-4 hover:border-border hover:shadow-sm transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: v.bg }}
              >
                <v.icon className="h-5 w-5" style={{ color: v.color }} />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1.5 text-sm">{v.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section className="bg-card rounded-3xl border border-border/60 p-8 md:p-12">
        <div className="mb-8">
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.16em]">
            Liên lạc
          </span>
          <h2 className="font-editorial font-black text-2xl text-foreground mt-1">
            Thông tin liên hệ
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              icon: MapPin,
              label: 'Địa chỉ',
              value: '123 Nguyễn Văn Cừ, Quận 1, TP. Hồ Chí Minh',
              href: undefined,
            },
            { icon: Phone, label: 'Hotline', value: '1800 6868', href: 'tel:18006868' },
            {
              icon: Mail,
              label: 'Email',
              value: 'support@taphoa.vn',
              href: 'mailto:support@taphoa.vn',
            },
            {
              icon: Clock,
              label: 'Giờ hoạt động',
              value: '8:00 – 21:00, Thứ 2–CN',
              href: undefined,
            },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'oklch(0.94 0.055 196)' }}
              >
                <item.icon className="h-4 w-4" style={{ color: 'oklch(0.57 0.135 196)' }} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold mb-0.5">
                  {item.label}
                </p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-bold text-primary hover:underline">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
