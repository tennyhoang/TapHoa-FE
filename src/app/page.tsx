'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronRight, TrendingUp, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products/ProductCard';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { useHubStore } from '@/store/hub.store';
import { Category } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất'       },
  { value: 'price_asc',  label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'name',       label: 'Tên A → Z'      },
];

const CAT_FALLBACKS = ['🥬', '🐟', '🥩', '🍎', '🥚', '🧀', '🌽', '🍄'];

function CategoryCircle({ cat, selected, onClick, index }: { cat: Category; selected: boolean; onClick: () => void; index: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
    >
      <div
        className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-150
          ${selected
            ? 'border-emerald-500'
            : 'border-gray-200 group-hover:border-emerald-300'
          }`}
      >
        {cat.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xl select-none">
            {CAT_FALLBACKS[index % CAT_FALLBACKS.length]}
          </div>
        )}
      </div>
      <span className={`text-xs font-medium text-center leading-tight max-w-[56px] truncate transition-colors ${selected ? 'text-emerald-600' : 'text-gray-600 group-hover:text-emerald-600'}`}>
        {cat.name}
      </span>
    </button>
  );
}

function HomeContent() {
  const searchParams  = useSearchParams();
  const urlSearch     = searchParams.get('search') ?? '';
  const urlSort       = searchParams.get('sortBy') ?? '';
  const urlIsNew      = searchParams.get('isNew') === 'true';
  const urlIsDiscount = searchParams.get('isDiscount') === 'true';

  const { currentHub } = useHubStore();

  const [mounted, setMounted]         = useState(false);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId]   = useState<string | undefined>();
  const [sortBy, setSortBy]           = useState('newest');
  const [page, setPage]               = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (urlSearch) { setSearch(urlSearch); setSearchInput(urlSearch); }
      if (urlSort)   setSortBy(urlSort);
    }, 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (urlSearch !== undefined) { setSearch(urlSearch); setSearchInput(urlSearch); }
    if (urlSort) setSortBy(urlSort);
  }, [urlSearch, urlSort]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    enabled: mounted,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, categoryId, sortBy, page, urlIsNew, urlIsDiscount],
    queryFn: () => productService.getAll({
      search, categoryId, sortBy, page, pageSize: 20,
      isNew:      urlIsNew      || undefined,
      isDiscount: urlIsDiscount || undefined,
    }),
    enabled: mounted,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <div className="space-y-0">
      {/* ── Hero ── */}
      <div className="bg-emerald-600 -mx-4 px-4 py-10 mb-8">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Nông sản tươi sạch
          </h1>
          <p className="text-emerald-100 text-sm md:text-base">
            Hàng nghìn sản phẩm sạch — chọn điểm nhận hàng gần nhất để mua ngay
          </p>

          {mounted && currentHub && (
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              Đang xem tại: <span className="font-bold">{currentHub.name}</span>
            </div>
          )}

          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm sản phẩm bạn cần..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-10 bg-white border-0 h-11 rounded-lg"
              />
            </div>
            <Button
              type="submit"
              className="bg-white text-emerald-700 hover:bg-emerald-50 h-11 px-6 rounded-lg font-bold border-0"
            >
              Tìm
            </Button>
          </form>
        </div>
      </div>

      {/* ── Categories ── */}
      {categories && categories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm">Danh mục sản phẩm</h2>
            <button className="text-xs text-emerald-600 flex items-center gap-0.5 hover:underline">
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* All */}
            <button
              type="button"
              onClick={() => { setCategoryId(undefined); setPage(1); }}
              className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
            >
              <div
                className={`w-14 h-14 rounded-full border-2 transition-all duration-150 flex items-center justify-center
                  ${!categoryId
                    ? 'border-emerald-500 bg-emerald-600'
                    : 'border-gray-200 bg-gray-50 group-hover:border-emerald-300'
                  }`}
              >
                <span className="text-xl select-none">🛒</span>
              </div>
              <span className={`text-xs font-medium transition-colors ${!categoryId ? 'text-emerald-600' : 'text-gray-600 group-hover:text-emerald-600'}`}>
                Tất cả
              </span>
            </button>

            {categories.map((cat, i) => (
              <CategoryCircle
                key={cat.id}
                cat={cat}
                index={i}
                selected={categoryId === cat.id}
                onClick={() => { setCategoryId(cat.id); setPage(1); }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* ── Sidebar Sort ── */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="border border-gray-200 rounded-xl overflow-hidden sticky top-28 bg-white">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> Sắp xếp
              </p>
            </div>
            <div className="p-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSortBy(opt.value); setPage(1); }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors
                    ${sortBy === opt.value
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Products ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile sort */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSortBy(opt.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 transition-colors
                  ${sortBy === opt.value
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Active search indicator */}
          {search && (
            <div className="flex items-center gap-2 mb-4 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-600">Kết quả cho: <strong className="text-gray-800">{search}</strong></span>
              <button
                type="button"
                className="ml-auto text-xs text-red-400 hover:text-red-600 font-medium"
                onClick={() => { setSearch(''); setSearchInput(''); }}
              >
                ✕ Xóa
              </button>
            </div>
          )}

          {/* Skeleton */}
          {!mounted || isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <div className="text-5xl">🔍</div>
              <p className="text-gray-500">Khu vực này chưa có sản phẩm hỗ trợ.</p>
              <button
                type="button"
                className="text-sm text-emerald-600 hover:underline"
                onClick={() => { setSearch(''); setSearchInput(''); setCategoryId(undefined); }}
              >
                Bấm vào đây để xem tất cả sản phẩm của kho tổng
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">{data?.totalCount}</span> sản phẩm
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data?.items.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-lg px-5 border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                  >
                    ← Trước
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = page <= 3 ? i + 1 : page - 2 + i;
                      if (p < 1 || p > totalPages) return null;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors
                            ${p === page
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-lg px-5 border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                  >
                    Sau →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
