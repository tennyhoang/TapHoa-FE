'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  LucideIcon,
  Leaf,
  Apple,
  Beef,
  Fish,
  Egg,
  Milk,
  Wheat,
  GlassWater,
  Snowflake,
  Package,
  Flame,
  ShoppingBasket,
} from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_ICONS: Array<{ key: string; icon: LucideIcon }> = [
  { key: 'rau', icon: Leaf },
  { key: 'trái', icon: Apple },
  { key: 'thịt', icon: Beef },
  { key: 'cá', icon: Fish },
  { key: 'trứng', icon: Egg },
  { key: 'sữa', icon: Milk },
  { key: 'gạo', icon: Wheat },
  { key: 'ngũ', icon: Wheat },
  { key: 'uống', icon: GlassWater },
  { key: 'đông', icon: Snowflake },
  { key: 'khô', icon: Package },
  { key: 'gia vị', icon: Flame },
];

function getCategoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const { key, icon } of CATEGORY_ICONS) {
    if (lower.includes(key)) return icon;
  }
  return ShoppingBasket;
}

export function CategoryCirclesSection() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="text-center mb-8">
          <Skeleton className="h-3 w-20 mx-auto mb-2 rounded" />
          <Skeleton className="h-7 w-48 mx-auto rounded" />
        </div>
        <div className="flex gap-5 md:gap-7 justify-center flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full" />
              <Skeleton className="h-3 w-14 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-10">
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.18em]">
          Danh mục
        </span>
        <h2 className="font-editorial font-black text-2xl text-foreground mt-1">
          Mua sắm theo danh mục
        </h2>
      </div>

      <div className="flex gap-5 md:gap-7 justify-center flex-wrap">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary group-hover:shadow-[0_4px_20px_oklch(0.57_0.135_196/0.20)] transition-all duration-300 bg-muted">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary rounded-full">
                  {(() => {
                    const Icon = getCategoryIcon(cat.name);
                    return <Icon className="h-7 w-7 text-muted-foreground/60" />;
                  })()}
                </div>
              )}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-200 rounded-full" />
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
