import Link from 'next/link';
import { BookOpen, Leaf, ShoppingBag, Truck, Star, ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    icon: Leaf,
    category: 'Dinh dưỡng',
    title: 'Rau xanh tươi — bí quyết chọn mua đúng cách',
    desc: 'Hướng dẫn phân biệt rau sạch VietGAP với rau thông thường, cách bảo quản và chế biến để giữ nguyên dinh dưỡng.',
    readTime: '4 phút đọc',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: ShoppingBag,
    category: 'Mua sắm thông minh',
    title: 'Mua thực phẩm online — 5 điều cần biết trước khi đặt',
    desc: 'Kinh nghiệm mua thực phẩm online an toàn, tiết kiệm và hiệu quả — từ cách đọc nhãn đến kiểm tra nguồn gốc xuất xứ.',
    readTime: '5 phút đọc',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Truck,
    category: 'Hệ thống Hub',
    title: 'Hub nhận hàng TapHoa hoạt động như thế nào?',
    desc: 'Hiểu rõ quy trình từ khi đặt hàng đến khi lấy hàng tại hub — đảm bảo thực phẩm tươi ngon và an toàn.',
    readTime: '3 phút đọc',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Star,
    category: 'Sản phẩm nổi bật',
    title: 'Gạo ST25 — "Gạo ngon nhất thế giới" đã đến TapHoa',
    desc: 'Câu chuyện đằng sau giống gạo ST25 đoạt giải quốc tế và lý do tại sao nó trở thành lựa chọn số 1 của triệu gia đình.',
    readTime: '6 phút đọc',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Leaf,
    category: 'Dinh dưỡng',
    title: 'Thực phẩm tươi sống — cách bảo quản đúng trong tủ lạnh',
    desc: 'Mẹo bảo quản thịt, cá, rau củ đúng cách giúp kéo dài độ tươi và giữ an toàn thực phẩm cho cả gia đình.',
    readTime: '4 phút đọc',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: ShoppingBag,
    category: 'Mua sắm thông minh',
    title: 'Lên thực đơn tuần — tiết kiệm 30% chi phí ăn uống',
    desc: 'Cách lập kế hoạch bữa ăn khoa học, kết hợp mua sắm theo nhóm để tiết kiệm tối đa mà vẫn đảm bảo dinh dưỡng.',
    readTime: '7 phút đọc',
    color: 'bg-yellow-50 text-yellow-600',
  },
];

const CATEGORIES = ['Tất cả', 'Dinh dưỡng', 'Mua sắm thông minh', 'Hệ thống Hub', 'Sản phẩm nổi bật'];

export default function CamNangPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">

      {/* Hero */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-orange-100">
          <BookOpen className="h-4 w-4" />
          Cẩm nang mua sắm
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Kiến thức & kinh nghiệm <span className="text-orange-600">mua sắm thông minh</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Tổng hợp các bài viết hữu ích về dinh dưỡng, cách chọn thực phẩm, và mẹo tiết kiệm từ đội ngũ TapHoa.
        </p>
      </section>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap justify-center">
        {CATEGORIES.map(cat => (
          <span
            key={cat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-colors ${
              cat === 'Tất cả'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {ARTICLES.map(article => (
          <div
            key={article.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${article.color} flex items-center justify-center shrink-0`}>
                <article.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold ${article.color.split(' ')[1]} bg-transparent`}>
                  {article.category}
                </span>
                <h3 className="font-bold text-gray-800 mt-1 leading-snug group-hover:text-orange-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-2">
                  {article.desc}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">{article.readTime}</span>
                  <span className="text-xs font-semibold text-orange-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Đọc tiếp <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="bg-orange-50 rounded-2xl border border-orange-100 p-8 text-center space-y-4">
        <h2 className="text-xl font-black text-gray-800">Bắt đầu mua sắm thông minh ngay hôm nay</h2>
        <p className="text-gray-500 text-sm">Hàng nghìn sản phẩm tươi ngon đang chờ bạn — giao tận hub gần nhà.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-full transition-colors text-sm"
        >
          Khám phá sản phẩm <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
