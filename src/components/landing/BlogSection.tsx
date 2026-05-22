import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const BLOGS = [
  {
    id: 1,
    emoji: '🍳',
    title: 'Cách chế biến tôm hùm Alaska đúng chuẩn nhà hàng',
    date: '20/05/2026',
    desc: 'Tôm hùm Alaska cần được sơ chế kỹ trước khi nấu để giữ được vị ngọt tự nhiên và độ dai giòn...',
  },
  {
    id: 2,
    emoji: '🐟',
    title: 'Top 5 món ngon từ cá hồi Na Uy cho bữa cơm gia đình',
    date: '18/05/2026',
    desc: 'Cá hồi Na Uy với hàm lượng omega-3 cao, thích hợp cho nhiều cách chế biến từ áp chảo đến sashimi...',
  },
  {
    id: 3,
    emoji: '🍲',
    title: 'Bí quyết nấu lẩu hải sản thơm ngon, không tanh',
    date: '15/05/2026',
    desc: 'Để có nồi lẩu hải sản ngon, bước quan trọng nhất là chọn nguyên liệu tươi và sơ chế đúng cách...',
  },
];

export function BlogSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-blue-600 rounded-full" />
          <h2 className="text-lg font-black text-gray-800">Cẩm nang ẩm thực</h2>
        </div>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          Xem tất cả <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BLOGS.map(blog => (
          <Link
            key={blog.id}
            href="#"
            className="flex gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-20 h-20 rounded-lg bg-blue-50 flex items-center justify-center text-3xl shrink-0">
              {blog.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-blue-500 font-medium mb-1">{blog.date}</p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
                {blog.title}
              </p>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">{blog.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
