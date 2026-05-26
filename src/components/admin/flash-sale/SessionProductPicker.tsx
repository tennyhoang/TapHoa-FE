'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ImageIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { productService } from '@/services/product.service';
import { flashSaleService } from '@/services/flash-sale.service';
import { formatPrice } from '@/lib/format';
import { useDebounce } from '@/hooks/useDebounce';

interface SelectedEntry {
  flashSalePrice: number;
  flashSaleStock: number;
  originalPrice: number;
  name: string;
}

interface Props {
  sessionId: string;
  existingProductIds: Set<string>;
  onSaved: () => void;
}

const PAGE_SIZE = 10;

export function SessionProductPicker({ sessionId, existingProductIds, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, SelectedEntry>>({});

  const debouncedSearch = useDebounce(search, 350);

  const { data, isFetching } = useQuery({
    queryKey: ['picker-products', debouncedSearch, page],
    queryFn: () => productService.getAll({ search: debouncedSearch, page, pageSize: PAGE_SIZE }),
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const toggleProduct = useCallback((id: string, name: string, originalPrice: number) => {
    setSelected(prev => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: { flashSalePrice: Math.round(originalPrice * 0.8), flashSaleStock: 50, originalPrice, name },
      };
    });
  }, []);

  const updateEntry = useCallback((id: string, field: 'flashSalePrice' | 'flashSaleStock', value: string) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return;
    setSelected(prev => prev[id] ? { ...prev, [id]: { ...prev[id], [field]: num } } : prev);
  }, []);

  const saveMutation = useMutation({
    mutationFn: () => {
      const items = Object.entries(selected).map(([productId, e]) => ({
        productId,
        flashSalePrice: e.flashSalePrice,
        flashSaleStock: e.flashSaleStock,
      }));
      return flashSaleService.admin.addItemsBulk(sessionId, items);
    },
    onSuccess: ({ added, skipped }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-items', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-sessions'] });
      setSelected({});
      toast.success(`Đã thêm ${added} sản phẩm${skipped > 0 ? ` (bỏ qua ${skipped} đã có)` : ''}`);
      onSaved();
    },
    onError: () => toast.error('Lưu thất bại'),
  });

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const selectedCount = Object.keys(selected).length;

  const pageNumbers: number[] = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="space-y-3">
      {/* Search */}
      <Input
        placeholder="Tìm tên sản phẩm..."
        value={search}
        onChange={e => handleSearchChange(e.target.value)}
        className="h-8 text-sm"
      />

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="w-10" />
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="w-28 text-right">Giá gốc</TableHead>
              <TableHead className="w-36 text-right">Giá Flash Sale</TableHead>
              <TableHead className="w-28 text-right">SL Flash</TableHead>
              <TableHead className="w-20 text-right">Giảm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {!isFetching && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy sản phẩm
                </TableCell>
              </TableRow>
            )}
            {products.map(p => {
              const alreadyAdded = existingProductIds.has(p.id);
              const entry = selected[p.id];
              const isChecked = !!entry;
              const discount = entry
                ? Math.round((1 - entry.flashSalePrice / p.price) * 100)
                : null;

              return (
                <TableRow
                  key={p.id}
                  className={alreadyAdded ? 'opacity-40' : isChecked ? 'bg-primary/5' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={isChecked}
                      disabled={alreadyAdded}
                      onChange={() => toggleProduct(p.id, p.name, p.price)}
                    />
                  </TableCell>
                  <TableCell>
                    {p.thumbnailUrl ? (
                      <div className="relative w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                        <Image src={p.thumbnailUrl} alt={p.name} fill className="object-cover" sizes="32px" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.categoryName}</p>
                    {alreadyAdded && <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Đã thêm</p>}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatPrice(p.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {isChecked ? (
                      <Input
                        type="number"
                        value={entry.flashSalePrice}
                        onChange={e => updateEntry(p.id, 'flashSalePrice', e.target.value)}
                        className="h-7 text-xs text-right w-28 ml-auto"
                        min={0}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isChecked ? (
                      <Input
                        type="number"
                        value={entry.flashSaleStock}
                        onChange={e => updateEntry(p.id, 'flashSaleStock', e.target.value)}
                        className="h-7 text-xs text-right w-24 ml-auto"
                        min={1}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {discount !== null ? (
                      <span className="text-xs font-semibold" style={{ color: 'oklch(0.60 0.22 25)' }}>
                        -{discount}%
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {totalCount} sản phẩm · trang {page}/{totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-6 w-6 rounded text-xs transition-colors ${
                  n === page
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sticky save bar */}
      {selectedCount > 0 && (
        <div className="sticky bottom-0 bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="text-sm">
            <span className="font-semibold text-foreground">{selectedCount} sản phẩm</span>
            <span className="text-muted-foreground"> đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected({})}>
              Bỏ chọn
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              {saveMutation.isPending ? 'Đang lưu...' : `Lưu phiên (${selectedCount})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
