'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  title: string;
  queryKey: string;
  params: Parameters<typeof productService.getAll>[0];
  viewAllHref?: string;
}

export function ProductSection({ title, queryKey, params, viewAllHref = '/' }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => productService.getAll({ pageSize: 5, ...params }),
  });

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-blue-600 rounded-full" />
          <h2 className="text-lg font-black text-gray-800">{title}</h2>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Xem tất cả <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.items.length ? (
        <p className="text-center py-12 text-gray-400 text-sm">Chưa có sản phẩm</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {data.items.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-2.5 rounded-full text-sm transition-all duration-150"
        >
          Xem tất cả {title}
        </Link>
      </div>
    </section>
  );
}
