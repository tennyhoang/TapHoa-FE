'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

const CATEGORY_EMOJIS: Record<string, string> = {
  'rau': '🥬',
  'trái': '🍊',
  'thịt': '🥩',
  'cá': '🐟',
  'trứng': '🥚',
  'sữa': '🥛',
  'gạo': '🌾',
  'ngũ': '🌾',
  'đồ uống': '🧃',
  'uống': '🧃',
  'đông': '❄️',
  'hàng khô': '🫙',
  'khô': '🫙',
  'gia vị': '🌶️',
};

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '🛒';
}

export function CategoryCirclesSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-10">
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.18em]">Danh mục</span>
        <h2 className="font-editorial font-black text-2xl text-foreground mt-1">
          Mua sắm theo danh mục
        </h2>
      </div>

      <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className="flex flex-col items-center gap-2.5 group focus:outline-none"
          >
            <div className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-border/60 group-hover:border-primary/50 group-hover:shadow-[0_4px_20px_oklch(0.57_0.135_196/0.18)] transition-all duration-200 bg-muted">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-110"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-2xl select-none">{getCategoryEmoji(cat.name)}</span>
                </div>
              )}
              {/* Hover tint */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/12 transition-colors duration-200" />
            </div>
            <span className="text-xs font-semibold text-foreground/70 group-hover:text-primary text-center max-w-[80px] leading-tight transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
