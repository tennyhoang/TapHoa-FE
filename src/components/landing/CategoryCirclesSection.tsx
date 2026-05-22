'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

const FALLBACK_ICONS = ['🦐', '🐟', '🦀', '🦑', '🥫', '🦞', '🐙', '🦪', '🥩', '🥦', '🍎', '🧀'];

export function CategoryCirclesSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-center text-xl font-black text-gray-800 mb-2">Danh mục sản phẩm</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Khám phá hàng nghìn sản phẩm theo từng danh mục</p>

      <div className="flex flex-wrap justify-center gap-5 md:gap-8">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-blue-200 group-hover:border-blue-500 bg-white flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200 overflow-hidden">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span className="select-none">{FALLBACK_ICONS[i % FALLBACK_ICONS.length]}</span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 text-center max-w-[72px] leading-tight transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
