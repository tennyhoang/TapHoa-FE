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
import type { Product } from '@/types';

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="bg-amber-400 text-stone-900 font-black text-lg rounded px-2 py-0.5 min-w-[36px] text-center tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-orange-200 font-semibold tracking-widest uppercase">{label}</span>
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
      <div className="bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-150 flex flex-col overflow-hidden h-full group">
        <div className="relative aspect-square bg-white overflow-hidden">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-xs text-gray-400 font-medium">Chưa có ảnh</span>
              </div>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs text-stone-500 border border-stone-300 bg-white px-3 py-1 rounded">Hết hàng</span>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <p className="text-xs font-semibold line-clamp-2 text-stone-800 leading-snug">{product.name}</p>
          <div className="mt-auto">
            {product.discountPrice ? (
              <>
                <p className="text-orange-600 font-black text-sm">{formatPrice(product.discountPrice)}</p>
                <p className="text-stone-400 text-xs line-through">{formatPrice(product.price)}</p>
              </>
            ) : (
              <p className="text-orange-600 font-black text-sm">{formatPrice(product.price)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={isPending || product.stock === 0}
            className="w-full text-xs font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
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
    <section className="mt-6 rounded-xl overflow-hidden border border-orange-200">
      <div className="bg-orange-700 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-white font-black text-xl tracking-wide">FLASH SALE</span>
            <span className="text-orange-200 text-sm ml-3">Giờ vàng giảm giá</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-200 text-xs">Kết thúc sau:</span>
          <div className="flex items-end gap-1">
            <CountdownUnit value={time.h} label="Giờ" />
            <span className="text-amber-400 font-black text-xl mb-4">:</span>
            <CountdownUnit value={time.m} label="Phút" />
            <span className="text-amber-400 font-black text-xl mb-4">:</span>
            <CountdownUnit value={time.s} label="Giây" />
          </div>
        </div>
      </div>

      <div className="bg-orange-50/60 p-4">
        {products.length === 0 ? (
          <p className="text-center py-10 text-stone-400 text-sm">Chưa có sản phẩm Flash Sale hôm nay</p>
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
