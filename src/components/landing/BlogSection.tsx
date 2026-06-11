import Link from 'next/link';
import Image from 'next/image';

const BLOGS = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=85&auto=format&fit=crop',
    category: 'Mẹo nấu ăn',
    categoryClass: 'bg-[var(--fresh)]',
    title: 'Cách chọn rau củ tươi ngon — bí quyết từ chuyên gia',
    date: '20/05/2026',
    desc: 'Rau củ tươi hay không phụ thuộc vào cách chọn lựa và bảo quản đúng cách từ lúc mua về đến bếp.',
    readTime: '4 phút đọc',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&q=85&auto=format&fit=crop',
    category: 'Dinh dưỡng',
    categoryClass: 'bg-primary',
    title: 'Top 5 loại trái cây giàu vitamin C tốt nhất cho mùa hè',
    date: '18/05/2026',
    desc: 'Bổ sung vitamin C qua trái cây tươi hiệu quả hơn thực phẩm chức năng, lại an toàn cho cả gia đình.',
    readTime: '3 phút đọc',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=85&auto=format&fit=crop',
    category: 'Công thức',
    categoryClass: 'bg-[var(--amber)]',
    title: 'Bữa cơm gia đình ngon — thực đơn 5 ngày tiết kiệm',
    date: '15/05/2026',
    desc: 'Lên thực đơn trước giúp tiết kiệm chi phí và giảm lãng phí thực phẩm đáng kể mỗi tuần.',
    readTime: '5 phút đọc',
  },
];

export function BlogSection() {
  return (
    <section className="py-10">
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.16em] block mb-1">
            Cẩm nang
          </span>
          <h2 className="font-editorial font-black text-[1.6rem] leading-tight text-foreground">
            Bếp & Ẩm thực
          </h2>
        </div>
        <Link
          href="/cam-nang"
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-semibold transition-colors mb-1"
        >
          Tất cả bài viết
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {BLOGS.map(blog => (
          <Link key={blog.id} href={`/cam-nang`} className="group block">
            <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-border hover:shadow-[0_4px_20px_oklch(0_0_0/0.07)] transition-all duration-200 h-full flex flex-col">
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <span
                  className={`absolute top-3.5 left-3.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${blog.categoryClass}`}
                >
                  {blog.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <time>{blog.date}</time>
                  <span>·</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className="font-editorial font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
                  {blog.desc}
                </p>
                <span className="text-primary text-xs font-semibold mt-1 flex items-center gap-1">
                  Đọc tiếp
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
