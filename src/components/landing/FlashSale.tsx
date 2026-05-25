'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-black text-xl sm:text-2xl tabular-nums rounded-xl px-2 sm:px-3 py-1.5 min-w-[44px] sm:min-w-[52px] text-center leading-none"
        style={{
          background: 'oklch(0.75 0.155 55)',
          color: 'oklch(0.20 0.04 50)',
        }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-semibold text-white/50 tracking-widest uppercase">{label}</span>
    </div>
  );
}

function FlashCard({ product }: { product: Product }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;

  const { mutate, isPending } = useMutation({
    mutationFn: () => cartService.add(product.id, 1),
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
    if (product.stock === 0) return;
    mutate();
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-[oklch(0.18_0.025_190)] rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 hover:shadow-[0_4px_24px_black/30] transition-all duration-200 flex flex-col group">
        <div className="relative aspect-square overflow-hidden bg-[oklch(0.14_0.015_190)]">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-white/30">Chưa có ảnh</span>
            </div>
          )}
          {discount && (
            <span
              className="absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-lg"
              style={{ background: 'oklch(0.75 0.155 55)', color: 'oklch(0.20 0.04 50)' }}
            >
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white/70 text-xs font-medium border border-white/20 px-3 py-1 rounded-full">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col gap-2 flex-1">
          <p className="text-xs font-semibold text-white/85 line-clamp-2 leading-snug">
            {product.name}
          </p>
          <div className="mt-auto">
            {product.discountPrice ? (
              <>
                <p className="font-black text-sm" style={{ color: 'oklch(0.75 0.155 55)' }}>
                  {formatPrice(product.discountPrice)}
                </p>
                <p className="text-white/35 text-xs line-through">{formatPrice(product.price)}</p>
              </>
            ) : (
              <p className="font-black text-sm" style={{ color: 'oklch(0.75 0.155 55)' }}>
                {formatPrice(product.price)}
              </p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={isPending || product.stock === 0}
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
  const [time, setTime] = useState({ h: 5, m: 59, s: 59 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const { data } = useQuery({
    queryKey: ['flash-sale-products'],
    queryFn: () => productService.getAll({ isDiscount: true, pageSize: 5, sortBy: 'price_asc' }),
  });

  const products = data?.items ?? [];

  return (
    <section
      className="mt-6 rounded-2xl overflow-hidden"
      style={{ background: 'oklch(0.14 0.022 188)' }}
    >
      {/* Header */}
      <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: 'oklch(0.60_0.22_25)', color: 'white' }}
              >
                Live
              </span>
              <span className="text-white font-editorial font-black text-2xl tracking-tight">Flash Sale</span>
            </div>
            <p className="text-white/40 text-xs">Giá ưu đãi trong thời gian có hạn</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs">Kết thúc sau</span>
          <div className="flex items-end gap-2">
            <CountdownUnit value={time.h} label="Giờ" />
            <span className="text-white/30 font-black text-xl mb-5">:</span>
            <CountdownUnit value={time.m} label="Phút" />
            <span className="text-white/30 font-black text-xl mb-5">:</span>
            <CountdownUnit value={time.s} label="Giây" />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 pb-5">
        {products.length === 0 ? (
          <p className="text-center py-12 text-white/30 text-sm">
            Chưa có sản phẩm Flash Sale hôm nay
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map(p => (
              <FlashCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
