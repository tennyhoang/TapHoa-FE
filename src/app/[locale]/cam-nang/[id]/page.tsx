import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { Article } from '@/services/article.service';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  'dinh-duong': { label: 'Dinh dưỡng', color: 'oklch(0.54 0.158 145)' },
  'mua-sam-thong-minh': { label: 'Mua sắm thông minh', color: 'oklch(0.57 0.135 196)' },
  'he-thong-hub': { label: 'Hệ thống Hub', color: 'oklch(0.55 0.15 280)' },
  'san-pham-noi-bat': { label: 'Sản phẩm nổi bật', color: 'oklch(0.75 0.155 55)' },
};

const DEFAULT_IMAGES: Record<string, string> = {
  'dinh-duong':
    'https://images.unsplash.com/photo-1557844352-761f2565b576?w=1200&q=85&auto=format&fit=crop',
  'mua-sam-thong-minh':
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=85&auto=format&fit=crop',
  'he-thong-hub':
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=85&auto=format&fit=crop',
  'san-pham-noi-bat':
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=85&auto=format&fit=crop',
};

async function getArticle(id: string): Promise<Article | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const articles: Article[] = await res.json();
    return articles.find(a => a.id === id) ?? null;
  } catch {
    return null;
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const meta = CATEGORY_META[article.category] ?? {
    label: article.category,
    color: 'oklch(0.55 0.1 200)',
  };
  const image =
    article.imageUrl ?? DEFAULT_IMAGES[article.category] ?? DEFAULT_IMAGES['dinh-duong'];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-8">
      {/* Back */}
      <Link
        href="/cam-nang"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Cẩm nang
      </Link>

      {/* Hero image */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
        <Image
          src={image}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 672px) 100vw, 672px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span
          className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: `${meta.color}dd` }}
        >
          {meta.label}
        </span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="font-editorial font-black text-2xl sm:text-3xl text-foreground leading-tight">
          {article.title}
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">{article.excerpt}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readTimeMinutes} phút đọc
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {new Date(article.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Content */}
      <div>
        <MarkdownContent content={article.content} size="lg" />
      </div>

      {/* Footer CTA */}
      <div
        className="rounded-2xl p-6 text-center space-y-3"
        style={{ background: 'oklch(0.95 0.03 196)' }}
      >
        <p className="font-semibold text-sm" style={{ color: 'oklch(0.35 0.1 196)' }}>
          Mua ngay tại TapHoa
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
          style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
        >
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  );
}
