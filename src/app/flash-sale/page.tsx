'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, ArrowLeft } from 'lucide-react';
import { flashSaleService, FlashSaleProduct } from '@/services/flash-sale.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { useFlashSaleCountdown } from '@/hooks/useFlashSaleCountdown';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function CountdownBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums"
        style={{ background: 'oklch(0.75 0.155 55)', color: 'oklch(0.18 0.04 50)' }}
      >
        {value}
      </div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}

function FlashProductCard({ item }: { item: FlashSaleProduct }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const discountPct = Math.round((1 - item.flashSalePrice / item.originalPrice) * 100);
  const stockPct    = item.flashSaleStock > 0
    ? Math.round((item.soldCount / item.flashSaleStock) * 100)
    : 100;

  const { mutate, isPending } = useMutation({
    mutationFn: () => cartService.add(item.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng!');
    },
    onError: () => toast.error('Thêm vào giỏ thất bại'),
  });

  const handleAdd = () => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }
    if (item.stockRemaining <= 0) return;
    mutate();
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      <Link href={`/products/${item.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
          </div>
        )}
        <span
          className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-lg"
          style={{ background: 'oklch(0.60 0.22 25)', color: 'white' }}
        >
          -{discountPct}%
        </span>
        {item.stockRemaining <= 0 && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground border border-border px-4 py-1.5 rounded-full bg-card">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">
            {item.categoryName}
          </p>
          <Link href={`/products/${item.id}`}>
            <p className="font-semibold text-sm text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">
              {item.name}
            </p>
          </Link>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-black text-lg" style={{ color: 'oklch(0.60 0.22 25)' }}>
              {formatPrice(item.flashSalePrice)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(item.originalPrice)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${stockPct}%`,
                  background: stockPct > 80
                    ? 'oklch(0.60 0.22 25)'
                    : stockPct > 40
                      ? 'oklch(0.75 0.155 55)'
                      : 'var(--primary)',
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Đã bán {item.soldCount} / {item.flashSaleStock} — còn {item.stockRemaining} sản phẩm
            </p>
          </div>

          <Button
            onClick={handleAdd}
            disabled={isPending || item.stockRemaining <= 0}
            size="sm"
            className="w-full gap-1.5 text-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isPending ? 'Đang thêm...' : item.stockRemaining <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FlashSalePage() {
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['flash-sale-current'],
    queryFn: flashSaleService.getCurrent,
    staleTime: 30_000,
  });

  const countdown = useFlashSaleCountdown(session?.endTime, () => {
    setTimeout(() => refetch(), 1000);
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </Link>
      </div>

      {/* Hero header */}
      <div
        className="rounded-3xl overflow-hidden p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8"
        style={{ background: 'oklch(0.14 0.022 188)' }}
      >
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
              style={{ background: 'oklch(0.60 0.22 25)', color: 'white' }}
            >
              Live
            </span>
            <Zap className="h-5 w-5" style={{ color: 'oklch(0.75 0.155 55)' }} />
          </div>
          <h1
            className="font-editorial font-black text-4xl sm:text-5xl tracking-tight text-white"
          >
            Flash Sale
          </h1>
          {session && (
            <p className="text-white/50 text-sm">{session.name}</p>
          )}
        </div>

        {isLoading ? (
          <div className="flex gap-3">
            {[0, 1, 2].map(i => <Skeleton key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />)}
          </div>
        ) : !session ? (
          <p className="text-white/30 text-sm">Không có phiên Flash Sale đang diễn ra</p>
        ) : countdown.isExpired ? (
          <p className="text-white/50 text-sm animate-pulse">Đang tải phiên tiếp theo...</p>
        ) : (
          <div>
            <p className="text-white/40 text-xs text-center mb-3 uppercase tracking-widest">Kết thúc sau</p>
            <div className="flex items-end gap-3">
              <CountdownBlock value={countdown.hours}   label="Giờ"  />
              <span className="text-white/30 font-black text-3xl mb-6">:</span>
              <CountdownBlock value={countdown.minutes} label="Phút" />
              <span className="text-white/30 font-black text-3xl mb-6">:</span>
              <CountdownBlock value={countdown.seconds} label="Giây" />
            </div>
          </div>
        )}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/60">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !session ? (
        <div className="text-center py-24 space-y-3">
          <Zap className="h-16 w-16 text-border mx-auto" />
          <p className="text-foreground font-semibold">Hiện chưa có Flash Sale</p>
          <p className="text-muted-foreground text-sm">Hãy quay lại vào thời gian Flash Sale để săn hàng giá tốt nhé!</p>
          <Link href="/products">
            <Button variant="outline" className="mt-2">Xem tất cả sản phẩm</Button>
          </Link>
        </div>
      ) : session.products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Phiên Flash Sale này chưa có sản phẩm</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {session.products.length} sản phẩm trong phiên này
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {session.products.map(item => (
              <FlashProductCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
