import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cẩm nang ẩm thực',
  description:
    'Bí quyết chọn thực phẩm tươi, công thức nấu ăn và mẹo bảo quản từ chuyên gia TapHoa.',
  openGraph: {
    title: 'Cẩm nang ẩm thực | TapHoa',
    description:
      'Bí quyết chọn thực phẩm tươi, công thức nấu ăn và mẹo bảo quản từ chuyên gia TapHoa.',
  },
};
import { Article } from '@/services/article.service';
import { ArticleGrid } from '@/components/cam-nang/ArticleGrid';

async function getArticles(): Promise<Article[]> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5084/api/v1';
    const res = await fetch(`${apiBase}/articles`, { cache: 'no-store' });
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
          Tổng hợp các bài viết hữu ích về dinh dưỡng, cách chọn thực phẩm và mẹo tiết kiệm từ đội
          ngũ TapHoa.
        </p>
      </section>

      <ArticleGrid articles={articles} />

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
