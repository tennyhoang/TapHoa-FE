import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const BLOGS = [
  {
    id: 1,
    emoji: '🥗',
    title: 'Bí quyết chọn rau củ tươi ngon tại chợ và siêu thị',
    date: '20/05/2026',
    desc: 'Rau củ tươi ngon cần được chọn kỹ từ màu sắc, độ cứng đến mùi hương tự nhiên...',
  },
  {
    id: 2,
    emoji: '🍱',
    title: 'Thực đơn cả tuần tiết kiệm với rau củ quả mùa hè',
    date: '18/05/2026',
    desc: 'Lên kế hoạch bữa ăn cả tuần giúp tiết kiệm chi phí và đảm bảo dinh dưỡng cho cả gia đình...',
  },
  {
    id: 3,
    emoji: '🛒',
    title: 'Mẹo mua sắm tạp hóa thông minh — tiết kiệm 30% mỗi tháng',
    date: '15/05/2026',
    desc: 'Mua đúng lúc, đúng lượng và biết tận dụng khuyến mãi là bí quyết tiết kiệm của nhiều bà nội trợ...',
  },
];

export function BlogSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-orange-600 rounded-full" />
          <h2 className="text-lg font-black text-stone-900">Cẩm nang ẩm thực</h2>
        </div>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-semibold"
        >
          Xem tất cả <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BLOGS.map(blog => (
          <Link
            key={blog.id}
            href="#"
            className="flex gap-3 bg-white border border-orange-100 rounded-xl p-4 hover:border-orange-300 hover:shadow-sm transition-all group"
          >
            <div className="w-20 h-20 rounded-lg bg-orange-50 flex items-center justify-center text-3xl shrink-0">
              {blog.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-orange-500 font-medium mb-1">{blog.date}</p>
              <p className="text-sm font-semibold text-stone-800 line-clamp-2 group-hover:text-orange-700 transition-colors leading-snug">
                {blog.title}
              </p>
              <p className="text-xs text-stone-400 line-clamp-2 mt-1">{blog.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
