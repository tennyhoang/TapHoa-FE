'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { Article } from '@/services/article.service';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  'dinh-duong':         { label: 'Dinh dưỡng',         color: 'oklch(0.54 0.158 145)' },
  'Dinh dưỡng':         { label: 'Dinh dưỡng',         color: 'oklch(0.54 0.158 145)' },
  'mua-sam-thong-minh': { label: 'Mua sắm thông minh', color: 'oklch(0.57 0.135 196)' },
  'Mua sắm thông minh': { label: 'Mua sắm thông minh', color: 'oklch(0.57 0.135 196)' },
  'he-thong-hub':       { label: 'Hệ thống Hub',       color: 'oklch(0.55 0.15 280)'  },
  'Hệ thống Hub':       { label: 'Hệ thống Hub',       color: 'oklch(0.55 0.15 280)'  },
  'san-pham-noi-bat':   { label: 'Sản phẩm nổi bật',   color: 'oklch(0.75 0.155 55)'  },
  'Sản phẩm nổi bật':   { label: 'Sản phẩm nổi bật',   color: 'oklch(0.75 0.155 55)'  },
  'Mẹo nấu ăn':         { label: 'Mẹo nấu ăn',         color: 'oklch(0.60 0.15 35)'   },
  'Công thức':          { label: 'Công thức',           color: 'oklch(0.58 0.14 310)'  },
};

const DEFAULT_IMAGES: Record<string, string> = {
  'dinh-duong':         'https://images.unsplash.com/photo-1557844352-761f2565b576?w=600&q=85&auto=format&fit=crop',
  'mua-sam-thong-minh': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=85&auto=format&fit=crop',
  'he-thong-hub':       'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=85&auto=format&fit=crop',
  'san-pham-noi-bat':   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=85&auto=format&fit=crop',
};

export function ArticleGrid({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState('');

  const categories = Array.from(new Set(articles.map(a => a.category)));

  const filtered = active
    ? articles.filter(a => a.category === active)
    : articles;

  return (
    <div className="space-y-8">
      {/* Filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {['', ...categories].map(key => {
            const isActive = active === key;
            const label = key ? (CATEGORY_META[key]?.label ?? key) : 'Tất cả';
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={isActive ? {
                  background: 'oklch(0.57 0.135 196)',
                  color: 'white',
                  borderColor: 'oklch(0.57 0.135 196)',
                } : {
                  background: 'transparent',
                  color: 'oklch(0.52 0.022 192)',
                  borderColor: 'oklch(0.88 0.008 90)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {articles.length === 0
            ? 'Chưa có bài viết nào. Admin hãy thêm bài từ trang quản lý.'
            : 'Không có bài viết trong danh mục này.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(article => {
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
    </div>
  );
}
