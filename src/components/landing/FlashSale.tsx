'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import { flashSaleService, FlashSaleProduct } from '@/services/flash-sale.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { useFlashSaleCountdown } from '@/hooks/useFlashSaleCountdown';
import { formatPrice } from '@/lib/format';

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-black text-xl sm:text-2xl tabular-nums rounded-xl px-2 sm:px-3 py-1.5 min-w-[44px] sm:min-w-[52px] text-center leading-none"
        style={{ background: 'oklch(0.75 0.155 55)', color: 'oklch(0.20 0.04 50)' }}
      >
        {value}
      </span>
      <span className="text-[10px] font-semibold text-white/50 tracking-widest uppercase">{label}</span>
    </div>
  );
}

function FlashCard({ item }: { item: FlashSaleProduct }) {
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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }
    if (item.stockRemaining <= 0) return;
    mutate();
  };

  return (
    <Link href={`/products/${item.id}`}>
      <div className="bg-[oklch(0.18_0.025_190)] rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 hover:shadow-[0_4px_24px_black/30] transition-all duration-200 flex flex-col group">
        <div className="relative aspect-square overflow-hidden bg-[oklch(0.14_0.015_190)]">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-white/30">Chưa có ảnh</span>
            </div>
          )}
          <span
            className="absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-lg"
            style={{ background: 'oklch(0.75 0.155 55)', color: 'oklch(0.20 0.04 50)' }}
          >
            -{discountPct}%
          </span>
          {item.stockRemaining <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white/70 text-xs font-medium border border-white/20 px-3 py-1 rounded-full">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col gap-2 flex-1">
          <p className="text-xs font-semibold text-white/85 line-clamp-2 leading-snug">{item.name}</p>

          <div className="mt-auto space-y-1.5">
            <p className="font-black text-sm" style={{ color: 'oklch(0.75 0.155 55)' }}>
              {formatPrice(item.flashSalePrice)}
            </p>
            <p className="text-white/35 text-xs line-through">{formatPrice(item.originalPrice)}</p>

            <div className="space-y-0.5">
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stockPct}%`,
                    background: stockPct > 80
                      ? 'oklch(0.60 0.22 25)'
                      : stockPct > 50
                        ? 'oklch(0.75 0.155 55)'
                        : 'oklch(0.57 0.135 196)',
                  }}
                />
              </div>
              <p className="text-[10px] text-white/40">
                Còn {item.stockRemaining} sản phẩm
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isPending || item.stockRemaining <= 0}
            className="w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export function FlashSale() {
  const { data: session, refetch } = useQuery({
    queryKey: ['flash-sale-current'],
    queryFn: flashSaleService.getCurrent,
    staleTime: 30_000,
  });

  const countdown = useFlashSaleCountdown(session?.endTime, () => {
    setTimeout(() => refetch(), 1000);
  });

  if (!session) {
    return (
      <section
        className="mt-6 rounded-2xl overflow-hidden"
        style={{ background: 'oklch(0.14 0.022 188)' }}
      >
        <div className="px-5 py-8 flex items-center gap-3">
          <Zap className="h-5 w-5 text-white/30" />
          <p className="text-white/30 text-sm">Hiện chưa có Flash Sale — quay lại sau nhé!</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ background: 'oklch(0.14 0.022 188)' }}
    >
      <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: 'oklch(0.60 0.22 25)', color: 'white' }}
              >
                Live
              </span>
              <span className="text-white font-editorial font-black text-2xl tracking-tight">Flash Sale</span>
            </div>
            <p className="text-white/40 text-xs">{session.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {countdown.isExpired ? (
            <span className="text-white/40 text-xs animate-pulse">Đang tải phiên tiếp theo...</span>
          ) : (
            <>
              <span className="text-white/40 text-xs">Kết thúc sau</span>
              <div className="flex items-end gap-2">
                <CountdownUnit value={countdown.hours}   label="Giờ"  />
                <span className="text-white/30 font-black text-xl mb-5">:</span>
                <CountdownUnit value={countdown.minutes} label="Phút" />
                <span className="text-white/30 font-black text-xl mb-5">:</span>
                <CountdownUnit value={countdown.seconds} label="Giây" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-5">
        {session.products.length === 0 ? (
          <p className="text-center py-12 text-white/30 text-sm">
            Chưa có sản phẩm trong phiên Flash Sale này
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {session.products.map(item => (
                <FlashCard key={item.id} item={item} />
              ))}
            </div>
            <div className="text-center mt-4">
              <Link
                href="/flash-sale"
                className="text-xs font-semibold text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
              >
                Xem tất cả sản phẩm Flash Sale →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
