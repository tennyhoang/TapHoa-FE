'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.add(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng!');
    },
    onError: () => toast.error('Thêm vào giỏ thất bại'),
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }
    if (product.stock === 0) return;
    addToCartMutation.mutate();
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-150 cursor-pointer flex flex-col h-full group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🥬</div>
          )}

          {/* Discount badge */}
          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="border border-gray-300 text-gray-500 text-xs font-medium px-3 py-1 rounded bg-white">Hết hàng</span>
            </div>
          )}

          {/* Quick add */}
          {product.stock > 0 && (
            <div className={`absolute bottom-0 left-0 right-0 p-2 transition-all duration-200 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-150 disabled:opacity-60"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="text-sm font-medium line-clamp-2 leading-snug text-gray-800">{product.name}</p>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
          )}

          <div className="mt-auto pt-1">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-600 font-bold text-sm">{formatPrice(product.discountPrice)}</span>
                <span className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-emerald-600 font-bold text-sm">{formatPrice(product.price)}</span>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-xs text-red-500 mt-0.5">Còn {product.stock} sản phẩm</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
