'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types';

type Variant = 'grid' | 'shelf' | 'featured';

interface Props {
  title: string;
  subtitle?: string;
  queryKey: string;
  params: Parameters<typeof productService.getAll>[0];
  viewAllHref?: string;
  variant?: Variant;
}

function GridLayout({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function ShelfLayout({ products }: { products: Product[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {products.map(p => (
        <div key={p.id} className="snap-start shrink-0 w-[180px] sm:w-[200px]">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

function FeaturedLayout({ products }: { products: Product[] }) {
  const [first, ...rest] = products;
  if (!first) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* First item spans 2 cols and 2 rows */}
      <div className="col-span-2 row-span-2">
        <Link href={`/products/${first.id}`}>
          <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-[0_4px_24px_oklch(0.57_0.135_196/0.12)] hover:-translate-y-0.5 transition-all duration-300 h-full group flex flex-col">
            <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '1/1' }}>
              {first.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={first.thumbnailUrl}
                  alt={first.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Chưa có ảnh</span>
                </div>
              )}
              {first.discountPrice && (
                <span className="absolute top-3 left-3 bg-[var(--amber)] text-[var(--amber-dark)] text-xs font-black px-2.5 py-1 rounded-lg">
                  -{Math.round((1 - first.discountPrice / first.price) * 100)}%
                </span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                {first.name}
              </p>
              {first.categoryName && (
                <p className="text-[10px] text-muted-foreground">{first.categoryName}</p>
              )}
              <p className="text-primary font-black text-lg mt-auto">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  first.discountPrice ?? first.price
                )}
              </p>
            </div>
          </div>
        </Link>
      </div>
      {/* Rest in grid */}
      {rest.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductSection({
  title,
  subtitle,
  queryKey,
  params,
  viewAllHref = '/products',
  variant = 'grid',
}: Props) {
  const t = useTranslations('ProductSection');
  const pageSize = variant === 'featured' ? 5 : 5;
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => productService.getAll({ pageSize, ...params }),
    staleTime: 30_000,
  });

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.16em] block mb-1">
            {t('eyebrow')}
          </span>
          <h2 className="font-editorial font-black text-[1.6rem] leading-tight text-foreground">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-semibold transition-colors shrink-0 mb-1"
        >
          {t('viewAll')}
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

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/60">
              <Skeleton className="aspect-square" />
              <div className="p-3.5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-14 text-muted-foreground text-sm">{t('empty')}</div>
      ) : variant === 'shelf' ? (
        <ShelfLayout products={data.items} />
      ) : variant === 'featured' ? (
        <FeaturedLayout products={data.items} />
      ) : (
        <GridLayout products={data.items} />
      )}

      {data?.items.length ? (
        <div className="text-center mt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-2.5 rounded-full text-sm transition-all duration-200"
          >
            {t('viewAllTitle', { title })}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
