'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap, Plus, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { flashSaleService, AdminSession, AdminSessionItem } from '@/services/flash-sale.service';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/lib/format';

function toLocalDatetimeValue(isoString: string) {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function SessionItems({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [flashPrice, setFlashPrice]   = useState('');
  const [flashStock, setFlashStock]   = useState('');

  const { data: items = [] } = useQuery({
    queryKey: ['admin-flash-sale-items', sessionId],
    queryFn: () => flashSaleService.admin.getItems(sessionId),
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products-search', productSearch],
    queryFn: () => productService.getAll({ search: productSearch, pageSize: 10 }),
    enabled: productSearch.length >= 2,
  });

  const addItemMutation = useMutation({
    mutationFn: () => flashSaleService.admin.addItem(sessionId, {
      productId:      selectedProductId,
      flashSalePrice: Number(flashPrice),
      flashSaleStock: Number(flashStock),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-items', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-sessions'] });
      setSelectedProductId('');
      setProductSearch('');
      setFlashPrice('');
      setFlashStock('');
      toast.success('Đã thêm sản phẩm vào phiên');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Thêm thất bại'),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => flashSaleService.admin.removeItem(sessionId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-items', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-sessions'] });
      toast.success('Đã xóa sản phẩm');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const canAdd = selectedProductId && Number(flashPrice) > 0 && Number(flashStock) > 0;

  return (
    <div className="mt-4 border-t border-border/40 pt-4 space-y-4">
      {/* Add product form */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thêm sản phẩm</p>
        <div className="space-y-2">
          <Input
            placeholder="Tìm tên sản phẩm (gõ ≥ 2 ký tự)..."
            value={productSearch}
            onChange={e => { setProductSearch(e.target.value); setSelectedProductId(''); }}
            className="h-8 text-sm"
          />
          {products && products.items.length > 0 && !selectedProductId && (
            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm max-h-44 overflow-y-auto">
              {products.items.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedProductId(p.id); setProductSearch(p.name); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2 border-b border-border/40 last:border-0"
                >
                  <span className="text-foreground truncate">{p.name}</span>
                  <span className="text-muted-foreground text-xs shrink-0">{formatPrice(p.price)}</span>
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Giá Flash Sale (VND)</label>
              <Input
                type="number"
                placeholder="VD: 25000"
                value={flashPrice}
                onChange={e => setFlashPrice(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Số lượng Flash Sale</label>
              <Input
                type="number"
                placeholder="VD: 100"
                value={flashStock}
                onChange={e => setFlashStock(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => addItemMutation.mutate()}
            disabled={!canAdd || addItemMutation.isPending}
            className="gap-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {addItemMutation.isPending ? 'Đang thêm...' : 'Thêm sản phẩm'}
          </Button>
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
          <Package className="h-4 w-4" />
          <span>Chưa có sản phẩm trong phiên này</span>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {items.map((item: AdminSessionItem) => (
            <div key={item.id} className="py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Gốc: {formatPrice(item.originalPrice)} →{' '}
                  <span className="font-semibold" style={{ color: 'oklch(0.60 0.22 25)' }}>
                    {formatPrice(item.flashSalePrice)}
                  </span>
                  {' '}· Tồn kho: {item.flashSaleStock - item.soldCount}/{item.flashSaleStock}
                </p>
              </div>
              <button
                onClick={() => { if (confirm('Xóa sản phẩm này?')) removeItemMutation.mutate(item.id); }}
                disabled={removeItemMutation.isPending && removeItemMutation.variables === item.id}
                className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: AdminSession }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: () => flashSaleService.admin.toggleSession(session.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-sessions'] });
      toast.success(session.isActive ? 'Đã tắt phiên' : 'Đã bật phiên');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => flashSaleService.admin.deleteSession(session.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-sessions'] });
      toast.success('Đã xóa phiên Flash Sale');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const now = new Date();
  const start = new Date(session.startTime);
  const end   = new Date(session.endTime);
  const isLive = session.isActive && start <= now && end > now;

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isLive && (
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white"
                style={{ background: 'oklch(0.60 0.22 25)' }}
              >
                Live
              </span>
            )}
            {!session.isActive && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                Tắt
              </span>
            )}
            <p className="font-semibold text-sm text-foreground">{session.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(session.startTime).toLocaleString('vi-VN')} → {new Date(session.endTime).toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{session.itemCount} sản phẩm</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title={session.isActive ? 'Tắt phiên' : 'Bật phiên'}
          >
            {session.isActive
              ? <ToggleRight className="h-5 w-5 text-primary" />
              : <ToggleLeft  className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { if (confirm('Xóa phiên Flash Sale này và toàn bộ sản phẩm?')) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && <SessionItems sessionId={session.id} />}
    </div>
  );
}

export default function AdminFlashSalePage() {
  const queryClient = useQueryClient();
  const [name, setName]           = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime]     = useState('');

  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-flash-sale-sessions'],
    queryFn: flashSaleService.admin.getSessions,
  });

  const createMutation = useMutation({
    mutationFn: () => flashSaleService.admin.createSession({
      name,
      startTime: new Date(startTime).toISOString(),
      endTime:   new Date(endTime).toISOString(),
      isActive:  true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flash-sale-sessions'] });
      setName(''); setStartTime(''); setEndTime('');
      toast.success('Đã tạo phiên Flash Sale');
    },
    onError: () => toast.error('Tạo phiên thất bại'),
  });

  const canCreate = name.trim() && startTime && endTime && new Date(startTime) < new Date(endTime);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flash Sale</h1>
        <p className="text-sm text-muted-foreground mt-1">Tạo phiên giảm giá có giới hạn thời gian và số lượng</p>
      </div>

      {/* Create session */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Zap className="h-4 w-4 text-primary" />
          Tạo phiên mới
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tên phiên</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Flash Sale Buổi Sáng — Thứ Hai"
              className="h-9"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Thời gian bắt đầu</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Thời gian kết thúc</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canCreate || createMutation.isPending}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo phiên'}
          </Button>
        </div>
      </div>

      {/* Sessions list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Danh sách phiên</span>
          {sessions.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {sessions.length}
            </span>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Chưa có phiên nào — tạo phiên đầu tiên ở trên
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {sessions.map(session => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
