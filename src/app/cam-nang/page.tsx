import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { Article } from '@/services/article.service';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  'dinh-duong':         { label: 'Dinh dưỡng',         color: 'oklch(0.54 0.158 145)' },
  'mua-sam-thong-minh': { label: 'Mua sắm thông minh', color: 'oklch(0.57 0.135 196)' },
  'he-thong-hub':       { label: 'Hệ thống Hub',       color: 'oklch(0.55 0.15 280)'  },
  'san-pham-noi-bat':   { label: 'Sản phẩm nổi bật',   color: 'oklch(0.75 0.155 55)'  },
};

const DEFAULT_IMAGES: Record<string, string> = {
  'dinh-duong':         'https://images.unsplash.com/photo-1557844352-761f2565b576?w=600&q=85&auto=format&fit=crop',
  'mua-sam-thong-minh': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=85&auto=format&fit=crop',
  'he-thong-hub':       'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=85&auto=format&fit=crop',
  'san-pham-noi-bat':   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=85&auto=format&fit=crop',
};

const CATEGORIES = ['Tất cả', 'Dinh dưỡng', 'Mua sắm thông minh', 'Hệ thống Hub', 'Sản phẩm nổi bật'];

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CamNangPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-12">

      {/* Hero */}
      <section className="text-center space-y-4">
        <div
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full border"
          style={{
            background: 'oklch(0.94 0.055 196)',
            color: 'oklch(0.40 0.12 196)',
            borderColor: 'oklch(0.85 0.08 196)',
          }}
        >
          <BookOpen className="h-4 w-4" />
          Cẩm nang mua sắm
        </div>
        <h1
          className="font-editorial font-black text-foreground leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          Kiến thức & kinh nghiệm mua sắm
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          Tổng hợp các bài viết hữu ích về dinh dưỡng, cách chọn thực phẩm và mẹo tiết kiệm từ đội ngũ TapHoa.
        </p>
      </section>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap justify-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={cat === 'Tất cả' ? {
              background: 'oklch(0.57 0.135 196)',
              color: 'white',
              borderColor: 'oklch(0.57 0.135 196)',
            } : {
              background: 'transparent',
              color: 'oklch(0.52 0.022 192)',
              borderColor: 'oklch(0.88 0.008 90)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Chưa có bài viết nào. Admin hãy thêm bài từ trang quản lý.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(article => {
            const meta  = CATEGORY_META[article.category] ?? { label: article.category, color: 'oklch(0.55 0.1 200)' };
            const image = article.imageUrl ?? DEFAULT_IMAGES[article.category] ?? DEFAULT_IMAGES['dinh-duong'];
            return (
              <Link key={article.id} href={`/cam-nang/${article.id}`} className="group block">
                <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-border hover:shadow-[0_4px_20px_oklch(0_0_0/0.07)] transition-all duration-200 h-full flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span
                      className="absolute top-3.5 left-3.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
                      style={{ background: `${meta.color}cc` }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="font-editorial font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTimeMinutes} phút đọc
                      </span>
                      <span className="text-primary text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Đọc tiếp <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <section
        className="rounded-3xl p-10 text-center space-y-5 relative overflow-hidden"
        style={{ background: 'oklch(0.18 0.038 192)' }}
      >
        <h2 className="font-editorial font-black text-white text-2xl">
          Bắt đầu mua sắm thông minh
        </h2>
        <p className="text-sm" style={{ color: 'oklch(0.60 0.04 192)' }}>
          Hàng nghìn sản phẩm tươi ngon — giao tận Hub gần nhà bạn.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-full text-sm transition-colors"
          style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
        >
          Khám phá sản phẩm <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
