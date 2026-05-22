import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, Star, Users } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { value: '10.000+', label: 'Khách hàng tin dùng' },
  { value: '5.000+', label: 'Sản phẩm đa dạng' },
  { value: '50+', label: 'Điểm nhận hàng' },
  { value: '99%', label: 'Hài lòng sau mua' },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Chất lượng đảm bảo',
    desc: 'Tất cả sản phẩm được kiểm định kỹ càng trước khi đến tay khách hàng. Cam kết đúng mô tả, đúng xuất xứ.',
  },
  {
    icon: Truck,
    title: 'Giao hàng nhanh chóng',
    desc: 'Hệ thống hub phủ rộng, đảm bảo hàng đến tay bạn trong thời gian sớm nhất, đặc biệt với thực phẩm tươi sống.',
  },
  {
    icon: Star,
    title: 'Giá cả hợp lý',
    desc: 'Làm việc trực tiếp với nhà cung cấp, cắt giảm trung gian để mang đến mức giá tốt nhất cho người tiêu dùng.',
  },
  {
    icon: Users,
    title: 'Phục vụ tận tâm',
    desc: 'Đội ngũ hỗ trợ khách hàng sẵn sàng giải đáp mọi thắc mắc từ thứ 2 đến Chủ Nhật, 8h–21h.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-4">

      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-orange-100">
          Về chúng tôi
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
          TapHoa — Tạp hóa sạch <br className="hidden md:block" />
          <span className="text-orange-600">ngay tại nhà bạn</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Nền tảng mua sắm tạp hóa online kết nối hàng nghìn sản phẩm thiết yếu — từ rau củ quả, thực phẩm tươi sống
          đến hàng khô và đồ dùng gia đình — giao tận điểm nhận hàng gần nhất.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors text-sm"
          >
            Mua sắm ngay
          </Link>
          <a
            href="tel:18006868"
            className="inline-flex items-center gap-2 border border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold px-6 py-2.5 rounded-full transition-colors text-sm"
          >
            <Phone className="h-4 w-4" /> Gọi tư vấn
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-orange-100 p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-orange-600 mb-1">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-7 bg-orange-600 rounded-full" />
          <h2 className="text-2xl font-black text-gray-800">Câu chuyện TapHoa</h2>
        </div>
        <p className="text-gray-600 leading-relaxed">
          TapHoa ra đời từ một bài toán quen thuộc: làm sao để mua thực phẩm hàng ngày tiện lợi hơn, tin cậy hơn mà không cần
          mất hàng giờ ở chợ hay siêu thị? Được khởi động vào năm 2024, chúng tôi xây dựng nền tảng kết nối người tiêu dùng với
          hàng nghìn sản phẩm thiết yếu từ các nhà cung cấp uy tín trên khắp Việt Nam.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Không chỉ là một trang thương mại điện tử thông thường, TapHoa vận hành hệ thống hub nhận hàng phân tán giúp rút ngắn
          thời gian giao hàng và giảm chi phí logistics. Mỗi đơn hàng đều được xử lý cẩn thận, đặc biệt với thực phẩm tươi sống —
          thu hoạch buổi sáng, giao tay khách buổi chiều.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Chúng tôi tin rằng mỗi gia đình Việt xứng đáng có được những sản phẩm chất lượng với mức giá hợp lý, giao đúng lúc,
          đúng nơi — và đó chính là lý do TapHoa tồn tại.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-orange-600 rounded-2xl p-8 text-white space-y-3">
          <h3 className="text-xl font-black">Sứ mệnh</h3>
          <p className="text-orange-100 leading-relaxed text-sm">
            Xây dựng TapHoa trở thành nền tảng tạp hóa online đáng tin cậy nhất Việt Nam — nơi người tiêu dùng có thể
            mua sắm thực phẩm và hàng tiêu dùng hàng ngày với sự tiện lợi, minh bạch và an tâm tuyệt đối.
          </p>
        </div>
        <div className="bg-stone-900 rounded-2xl p-8 text-white space-y-3">
          <h3 className="text-xl font-black">Tầm nhìn</h3>
          <p className="text-orange-200 leading-relaxed text-sm">
            Trong 3 năm tới, TapHoa hướng đến phủ sóng hệ thống hub nhận hàng tại toàn bộ các tỉnh thành lớn,
            mở rộng danh mục sản phẩm lên 20.000+ SKU và trở thành người bạn đồng hành mua sắm của triệu gia đình Việt.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-800">Giá trị cốt lõi</h2>
          <p className="text-gray-500 text-sm">Những cam kết chúng tôi giữ với từng khách hàng</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {VALUES.map(v => (
            <div key={v.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <v.icon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">{v.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-orange-600 rounded-full" />
          <h2 className="text-2xl font-black text-gray-800">Thông tin liên hệ</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Địa chỉ</p>
              <p className="text-sm text-gray-700 font-medium">266 Đội Cấn, Ba Đình, Hà Nội</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Hotline</p>
              <a href="tel:18006868" className="text-sm text-orange-600 font-bold hover:underline">1800 6868</a>
              <p className="text-xs text-gray-400">(miễn phí)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Email</p>
              <a href="mailto:support@taphoa.vn" className="text-sm text-orange-600 font-medium hover:underline">support@taphoa.vn</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Giờ hoạt động</p>
              <p className="text-sm text-gray-700 font-medium">8:00 – 21:00</p>
              <p className="text-xs text-gray-400">Thứ 2 – Chủ Nhật</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
