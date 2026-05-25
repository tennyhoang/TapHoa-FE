'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products/ProductCard';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất'       },
  { value: 'price_asc',  label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'name',       label: 'Tên A → Z'      },
];


function CategoryCircle({ cat, selected, onClick }: {
  cat: Category; selected: boolean; onClick: () => void; index: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
    >
      <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-150
        ${selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border group-hover:border-primary/50'
        }`}
      >
        {cat.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-lg font-black text-muted-foreground select-none">
              {cat.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <span className={`text-xs font-medium text-center leading-tight max-w-[56px] truncate transition-colors
        ${selected ? 'text-primary' : 'text-foreground/70 group-hover:text-primary'}`}
      >
        {cat.name}
      </span>
    </button>
  );
}

function AllCategoriesModal({ open, onOpenChange, categories, selectedId, onSelect }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tất cả danh mục</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2 max-h-[60vh] overflow-y-auto pr-1">
          {categories.map((parent) => {
            const parentActive = selectedId === parent.id || parent.children.some(c => c.id === selectedId);
            return (
              <div key={parent.id}>
                <button
                  type="button"
                  onClick={() => { onSelect(parent.id); onOpenChange(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                    ${parentActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60 text-foreground'}`}
                >
                  {parent.name}
                  <span className="ml-auto text-xs opacity-40">›</span>
                </button>
                {parent.children.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                    {parent.children.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => { onSelect(child.id); onOpenChange(false); }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                          ${selectedId === child.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
                          }`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlSearch       = searchParams.get('search') ?? '';
  const urlCategoryId   = searchParams.get('categoryId') ?? '';
  const urlCategoryName = searchParams.get('categoryName') ?? '';
  const urlSort         = searchParams.get('sortBy') ?? '';
  const urlIsNew        = searchParams.get('isNew') === 'true';
  const urlIsDiscount   = searchParams.get('isDiscount') === 'true';

  const [mounted, setMounted]                     = useState(false);
  const [searchInput, setSearchInput]             = useState('');
  const [search, setSearch]                       = useState('');
  const debouncedSearchInput                       = useDebounce(searchInput, 300);
  const [categoryId, setCategoryId]               = useState<string | undefined>();
  const [sortBy, setSortBy]                       = useState('newest');
  const [page, setPage]                           = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      if (urlSearch)     { setSearch(urlSearch); setSearchInput(urlSearch); }
      if (urlCategoryId) setCategoryId(urlCategoryId);
      if (urlSort)       setSortBy(urlSort);
    }, 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSearch(debouncedSearchInput);
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    enabled: mounted,
  });

  useEffect(() => {
    if (!urlCategoryName || !categories || categoryId) return;
    const lower = urlCategoryName.toLowerCase();
    for (const cat of categories) {
      if (cat.name.toLowerCase().includes(lower) || lower.includes(cat.name.toLowerCase())) {
        setCategoryId(cat.id);
        return;
      }
    }
  }, [categories, urlCategoryName, categoryId]);

  const { data, isLoading } = useQuery({
    queryKey: ['products-listing', search, categoryId, sortBy, page, urlIsNew, urlIsDiscount],
    queryFn: () => productService.getAll({
      search:     search || undefined,
      categoryId: categoryId || undefined,
      sortBy,
      page,
      pageSize:   20,
      isNew:      urlIsNew      || undefined,
      isDiscount: urlIsDiscount || undefined,
    }),
    enabled: mounted && (!urlCategoryName || !!categoryId),
  });

  const activeCategoryName = useMemo(() => {
    if (!categoryId || !categories) return undefined;
    for (const cat of categories) {
      if (cat.id === categoryId) return cat.name;
      const child = cat.children.find(c => c.id === categoryId);
      if (child) return child.name;
    }
    return undefined;
  }, [categoryId, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id === categoryId ? undefined : id);
    setPage(1);
  };

  const clearAll = () => {
    setSearch(''); setSearchInput(''); setCategoryId(undefined); setPage(1);
    router.push('/products');
  };

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  const pageTitle = urlIsNew
    ? 'Hàng mới về'
    : urlIsDiscount
      ? 'Giá tốt mỗi ngày'
      : urlSearch
        ? `Kết quả: "${urlSearch}"`
        : activeCategoryName ?? (urlCategoryName || 'Tất cả sản phẩm');

  return (
    <div className="space-y-0">
      {/* Page header + search */}
      <div className="mb-6">
        <h1 className="font-editorial font-black text-2xl text-foreground mb-4">{pageTitle}</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm sản phẩm..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10 h-10 rounded-xl border-border bg-muted/40 focus:bg-card"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-5 rounded-xl font-semibold">
            Tìm
          </Button>
        </form>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground/80 text-sm">Danh mục</p>
            <button
              type="button"
              onClick={() => setShowAllCategories(true)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => { setCategoryId(undefined); setPage(1); }}
              className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
            >
              <div className={`w-14 h-14 rounded-2xl border-2 transition-all duration-150 flex items-center justify-center
                ${!categoryId
                  ? 'border-primary bg-primary ring-2 ring-primary/20'
                  : 'border-border bg-muted group-hover:border-primary/50'
                }`}
              >
                <span className={`text-xs font-bold select-none ${!categoryId ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  Tất cả
                </span>
              </div>
              <span className={`text-xs font-medium transition-colors ${!categoryId ? 'text-primary' : 'text-foreground/70'}`}>
                Tất cả
              </span>
            </button>
            {categories.map((cat, i) => (
              <CategoryCircle
                key={cat.id}
                cat={cat}
                index={i}
                selected={categoryId === cat.id || cat.children.some(c => c.id === categoryId)}
                onClick={() => handleSelectCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar sort (desktop) */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="border border-border/60 rounded-2xl overflow-hidden sticky top-28 bg-card">
            <div className="px-4 py-3 border-b border-border/60">
              <p className="font-semibold text-sm text-foreground/80">Sắp xếp</p>
            </div>
            <div className="p-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSortBy(opt.value); setPage(1); }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors
                    ${sortBy === opt.value
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/60 text-muted-foreground'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Mobile sort pills */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setSortBy(opt.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 transition-colors
                  ${sortBy === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Active filters */}
          {(search || activeCategoryName) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {activeCategoryName && (
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                  {activeCategoryName}
                  <button type="button" onClick={() => { setCategoryId(undefined); setPage(1); }} className="ml-0.5 hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-muted text-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-border">
                  <Search className="h-3 w-3" />
                  {search}
                  <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }} className="ml-0.5 hover:opacity-75">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {!mounted || isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/60">
                  <Skeleton className="aspect-square" />
                  <div className="p-3.5 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <p className="text-muted-foreground text-lg font-semibold">Không tìm thấy sản phẩm nào.</p>
              <button type="button" onClick={clearAll} className="text-sm text-primary hover:underline font-medium">
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{data?.totalCount}</span> sản phẩm
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data?.items.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="rounded-xl px-5 border-border text-muted-foreground hover:border-primary/50 hover:text-primary">
                    ← Trước
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = page <= 3 ? i + 1 : page - 2 + i;
                      if (p < 1 || p > totalPages) return null;
                      return (
                        <button key={p} type="button" onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                            ${p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/60'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="rounded-xl px-5 border-border text-muted-foreground hover:border-primary/50 hover:text-primary">
                    Sau →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AllCategoriesModal
        open={showAllCategories}
        onOpenChange={setShowAllCategories}
        categories={categories ?? []}
        selectedId={categoryId}
        onSelect={id => { handleSelectCategory(id); }}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
