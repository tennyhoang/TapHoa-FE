'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

const FALLBACK_ICONS = ['🥬', '🍎', '🥩', '🥚', '🌾', '🥫', '🧃', '🍜', '🫙', '🧈', '🫒', '🌽'];

export function CategoryCirclesSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-center text-xl font-black text-stone-900 mb-1">Danh mục sản phẩm phổ biến</h2>
      <p className="text-center text-sm text-stone-500 mb-7">Khám phá hàng nghìn sản phẩm theo từng danh mục</p>

      <div className="flex flex-wrap justify-center gap-5 md:gap-8">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-orange-200 group-hover:border-orange-500 bg-white flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:bg-orange-50 transition-all duration-200 overflow-hidden">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span className="select-none">{FALLBACK_ICONS[i % FALLBACK_ICONS.length]}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-stone-600 group-hover:text-orange-600 text-center max-w-[72px] leading-tight transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
