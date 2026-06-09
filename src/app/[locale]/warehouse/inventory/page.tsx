'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Package, AlertTriangle, Search, Minus, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { warehouseManagerService } from '@/services/warehouse-manager.service';
import { WarehouseInventoryItem } from '@/types';
import { formatPrice } from '@/lib/format';

type FilterType = '' | 'low' | 'out';

const FILTER_TABS: { label: string; value: FilterType }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Sắp hết', value: 'low' },
  { label: 'Hết hàng', value: 'out' },
];

function InventoryRow({
  item,
  onAdjust,
  adjusting,
}: {
  item: WarehouseInventoryItem;
  onAdjust: (productId: string, delta: number) => void;
  adjusting: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Package className="h-5 w-5 text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {item.categoryName} · {formatPrice(item.price)}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {item.isOutOfStock ? (
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              Hết hàng
            </span>
          ) : item.isLowStock ? (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Sắp hết
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onAdjust(item.id, -1)}
          disabled={adjusting || item.stock <= 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span
          className={`w-10 text-center font-bold text-sm ${item.isOutOfStock ? 'text-red-500' : item.isLowStock ? 'text-amber-600' : 'text-gray-900'}`}
        >
          {item.stock}
        </span>
        <button
          type="button"
          onClick={() => onAdjust(item.id, 1)}
          disabled={adjusting}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-inventory', search, filter],
    queryFn: () =>
      warehouseManagerService.getInventory({
        search: search || undefined,
        filter: filter || undefined,
        pageSize: 100,
      }),
    staleTime: 30_000,
  });

  const adjustMutation = useMutation({
    mutationFn: ({ productId, delta }: { productId: string; delta: number }) =>
      warehouseManagerService.adjustStock(productId, delta),
    onMutate: ({ productId }) => setAdjustingId(productId),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory'] });
      toast.success(`Đã cập nhật tồn kho: ${result.name} — ${result.stock} sản phẩm`);
    },
    onError: () => toast.error('Không thể cập nhật tồn kho'),
    onSettled: () => setAdjustingId(null),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý tồn kho</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1 w-fit">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              filter === tab.value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="pl-9 h-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Package className="h-12 w-12 text-gray-200" />
          <p className="text-sm text-gray-400">Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <InventoryRow
              key={item.id}
              item={item}
              onAdjust={(productId, delta) => adjustMutation.mutate({ productId, delta })}
              adjusting={adjustingId === item.id && adjustMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
