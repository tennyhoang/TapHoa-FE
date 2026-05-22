import Link from 'next/link';

const BLOGS = [
  {
    id: 1,
    category: 'Mẹo nấu ăn',
    title: 'Cách chọn rau củ tươi ngon — bí quyết từ chuyên gia',
    date: '20/05/2026',
    desc: 'Rau củ tươi hay không phụ thuộc vào cách chọn lựa và bảo quản đúng cách từ lúc mua về...',
  },
  {
    id: 2,
    category: 'Dinh dưỡng',
    title: 'Top 5 loại trái cây giàu vitamin C tốt nhất cho mùa hè',
    date: '18/05/2026',
    desc: 'Bổ sung vitamin C qua trái cây tươi hiệu quả hơn thực phẩm chức năng, lại an toàn hơn...',
  },
  {
    id: 3,
    category: 'Công thức',
    title: 'Bữa cơm gia đình ngon — thực đơn 5 ngày tiết kiệm',
    date: '15/05/2026',
    desc: 'Lên thực đơn trước giúp tiết kiệm chi phí và giảm lãng phí thực phẩm đáng kể mỗi tuần...',
  },
];

export function BlogSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-emerald-600 rounded-full" />
          <h2 className="text-lg font-black text-gray-800">Cẩm nang ẩm thực</h2>
        </div>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BLOGS.map(blog => (
          <Link
            key={blog.id}
            href="#"
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-300 hover:shadow-sm transition-all group"
          >
            {/* Placeholder thumbnail */}
            <div className="h-36 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                {blog.category}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-emerald-500 font-medium mb-1">{blog.date}</p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug mb-2">
                {blog.title}
              </p>
              <p className="text-xs text-gray-400 line-clamp-2">{blog.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
