'use client';

import { useRef } from 'react';
import { Search, X, TrendingUp, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { productService } from '@/services/product.service';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  showSuggestions: boolean;
  hotKeywords: string[];
  onSuggestionClick: (kw: string) => void;
  searchButtonLabel: string;
  placeholder: string;
  popularSearchesLabel: string;
}

export function HeaderSearchBar({
  search,
  onSearchChange,
  onSubmit,
  onFocus,
  onBlur,
  showSuggestions,
  hotKeywords,
  onSuggestionClick,
  searchButtonLabel,
  placeholder,
  popularSearchesLabel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedSearch = useDebounce(search, 300);

  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['search-suggest', debouncedSearch],
    queryFn: () => productService.getAll({ search: debouncedSearch, pageSize: 6 }),
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 30_000,
  });

  const products = suggestions?.items ?? [];
  const hasTyped = search.trim().length >= 2;

  const handleProductClick = (id: string) => {
    router.push(`/products/${id}`);
    onSearchChange('');
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={onSubmit} className="flex-1 relative">
      <div className="relative">
        <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-full text-sm bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all text-foreground placeholder-muted-foreground"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-14 sm:right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-6 sm:h-7 px-2.5 sm:px-4 text-xs font-semibold transition-colors"
        >
          {searchButtonLabel}
        </button>
      </div>

      {/* Dropdown */}
      <div
        onMouseDown={e => e.preventDefault()}
        className={`absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden transition-all duration-150 origin-top ${
          showSuggestions
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        {hasTyped ? (
          /* --- Product autocomplete --- */
          isFetching ? (
            <div className="p-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-1">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-muted-foreground tracking-[0.14em] uppercase">
                Gợi ý sản phẩm
              </p>
              {products.map(product => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductClick(product.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
                    {product.thumbnailUrl ? (
                      <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-primary font-semibold">
                      {(product.discountPrice ?? product.price).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </button>
              ))}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-primary hover:bg-primary/8 transition-colors border-t border-border/50 mt-1"
              >
                <Search className="h-3.5 w-3.5" />
                Xem tất cả kết quả cho &quot;{search}&quot;
              </button>
            </>
          ) : (
            <div className="px-4 py-5 text-center text-sm text-muted-foreground">
              Không tìm thấy sản phẩm cho &quot;{search}&quot;
            </div>
          )
        ) : (
          /* --- Hot keywords when empty --- */
          <>
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground tracking-[0.14em] uppercase">
              {popularSearchesLabel}
            </p>
            {hotKeywords.map(keyword => (
              <button
                key={keyword}
                type="button"
                onClick={() => onSuggestionClick(keyword)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors text-left"
              >
                <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{keyword}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            ))}
          </>
        )}
      </div>
    </form>
  );
}
