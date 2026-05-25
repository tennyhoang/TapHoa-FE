'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  title: string;
  subtitle?: string;
  queryKey: string;
  params: Parameters<typeof productService.getAll>[0];
  viewAllHref?: string;
}

export function ProductSection({
  title,
  subtitle,
  queryKey,
  params,
  viewAllHref = '/products',
}: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => productService.getAll({ pageSize: 5, ...params }),
  });

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.16em] block mb-1">
            Sản phẩm
          </span>
          <h2 className="font-editorial font-black text-[1.6rem] leading-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-semibold transition-colors shrink-0 mb-1"
        >
          Xem tất cả
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
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
        <div className="text-center py-14 text-muted-foreground text-sm">
          Chưa có sản phẩm
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {data.items.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {data?.items.length ? (
        <div className="text-center mt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-2.5 rounded-full text-sm transition-all duration-200"
          >
            Xem tất cả {title}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
