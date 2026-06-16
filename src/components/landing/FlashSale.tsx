'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { flashSaleService, FlashSaleProduct } from '@/services/flash-sale.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { useFlashSaleCountdown } from '@/hooks/useFlashSaleCountdown';
import { formatPrice } from '@/lib/format';

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-black text-xl sm:text-2xl tabular-nums bg-foreground text-background rounded-lg px-2 sm:px-3 py-1.5 min-w-[44px] sm:min-w-[52px] text-center leading-none font-mono">
        {value}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

function FlashCard({ item }: { item: FlashSaleProduct }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const discountPct = Math.round((1 - item.flashSalePrice / item.originalPrice) * 100);
  const stockPct =
    item.flashSaleStock > 0 ? Math.round((item.soldCount / item.flashSaleStock) * 100) : 100;

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
    <Link
      href={`/products/${item.id}`}
      aria-label={`${item.name} — giảm ${discountPct}%, còn ${item.stockRemaining} sản phẩm`}
    >
      <div className="bg-card rounded-2xl overflow-hidden border border-[var(--orange-light)] hover:shadow-lg hover:shadow-orange-100 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex flex-col group">
        <div className="relative aspect-square overflow-hidden bg-muted/50">
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
              <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
            </div>
          )}
          <span className="absolute top-2.5 left-2.5 bg-[var(--amber)] text-[var(--amber-dark)] text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
            -{discountPct}%
          </span>
          {item.stockRemaining <= 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center backdrop-blur-[1px]">
              <span className="border border-border text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full bg-card">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="p-3.5 flex flex-col gap-2 flex-1">
          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
            {item.name}
          </p>

          <div className="mt-auto space-y-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-base text-[var(--orange)]">
                {formatPrice(item.flashSalePrice)}
              </span>
              <span
                className="text-muted-foreground text-xs line-through"
                aria-label={`Giá gốc ${formatPrice(item.originalPrice)}`}
              >
                {formatPrice(item.originalPrice)}
              </span>
            </div>

            <div className="space-y-0.5">
              <div
                role="progressbar"
                aria-valuenow={stockPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Đã bán ${stockPct}% số lượng`}
                className="w-full h-1.5 rounded-full bg-[var(--orange)]/15 overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stockPct}%`,
                    background:
                      stockPct > 80
                        ? 'var(--destructive)'
                        : stockPct > 50
                          ? 'var(--amber)'
                          : 'var(--primary)',
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Còn {item.stockRemaining} sản phẩm
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isPending || item.stockRemaining <= 0}
            aria-label={`Thêm ${item.name} vào giỏ hàng`}
            className="w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-40 shadow-sm"
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            {isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </Link>
  );
}

function FlashCarousel({ products }: { products: FlashSaleProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => el.removeEventListener('scroll', updateScrollButtons);
  }, [updateScrollButtons]);

  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      const cardWidth = el.querySelector('*')?.clientWidth ?? 200;
      const gap = 16;
      const step = cardWidth + gap;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('*')?.clientWidth ?? 200;
    const gap = 16;
    el.scrollBy({ left: (cardWidth + gap) * (dir === 'left' ? -1 : 1), behavior: 'smooth' });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-5 px-5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(item => (
          <div key={item.id} className="snap-start shrink-0 w-[170px] sm:w-[190px]">
            <FlashCard item={item} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scrollBy('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Cuộn trái"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollBy('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Cuộn phải"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}
    </div>
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
      <section className="mt-6 rounded-3xl overflow-hidden bg-[var(--orange-light)] border border-[var(--orange)]/15">
        <div className="px-6 py-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-200">
            <Zap className="h-5 w-5 text-white fill-white" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground text-sm">
            Hiện chưa có Flash Sale — quay lại sau nhé!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-3xl overflow-hidden bg-[var(--orange-light)] border border-[var(--orange)]/15">
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange-100">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
            <Zap className="h-6 w-6 text-white fill-white" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest bg-orange-500 text-white">
                Live
              </span>
              <span className="font-black text-2xl tracking-tight text-foreground">
                Flash Sale
              </span>
            </div>
            <p className="text-muted-foreground text-xs">{session.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {countdown.isExpired ? (
            <span className="text-muted-foreground text-xs animate-pulse">
              Đang tải phiên tiếp theo...
            </span>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-medium">KẾT THÚC SAU</p>
              <div
                role="timer"
                aria-live="polite"
                aria-label={`Còn ${countdown.hours} giờ ${countdown.minutes} phút ${countdown.seconds} giây`}
                className="flex items-end gap-1.5"
              >
                <CountdownUnit value={countdown.hours} label="Giờ" />
                <span className="font-black text-xl pb-5 text-muted-foreground" aria-hidden="true">
                  :
                </span>
                <CountdownUnit value={countdown.minutes} label="Phút" />
                <span className="font-black text-xl pb-5 text-muted-foreground" aria-hidden="true">
                  :
                </span>
                <CountdownUnit value={countdown.seconds} label="Giây" />
              </div>
              <Link
                href="/flash-sale"
                className="hidden sm:block text-sm font-semibold text-orange-600 hover:underline ml-2"
              >
                Xem tất cả →
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="pb-6">
        {session.products.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">
            Chưa có sản phẩm trong phiên Flash Sale này
          </p>
        ) : (
          <FlashCarousel products={session.products} />
        )}
      </div>
    </section>
  );
}
