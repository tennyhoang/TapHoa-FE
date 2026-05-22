'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.id}`);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="bg-white rounded-xl overflow-hidden border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col h-full group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-square bg-orange-50 overflow-hidden">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <span className="text-xs text-gray-400 font-medium">Chưa có ảnh</span>
            </div>
          )}

          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="border border-stone-300 text-stone-500 text-xs font-medium px-3 py-1 rounded bg-white">Hết hàng</span>
            </div>
          )}

          {/* Quick action buttons */}
          {product.stock > 0 && (
            <div className={`absolute bottom-2 left-0 right-0 flex justify-center gap-2 transition-all duration-200 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                title="Thêm vào giỏ"
                className="w-9 h-9 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
              <button
                onClick={handleQuickView}
                title="Xem nhanh"
                className="w-9 h-9 rounded-full bg-white hover:bg-orange-50 text-stone-700 flex items-center justify-center shadow-md border border-orange-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="text-sm font-semibold line-clamp-2 leading-snug text-stone-800">{product.name}</p>

          {product.categoryName && (
            <p className="text-[10px] text-stone-400">Xuất xứ: {product.categoryName}</p>
          )}

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-400">({product.reviewCount})</span>
            </div>
          )}

          <div className="mt-auto pt-1">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-orange-600 font-bold text-sm">{formatPrice(product.discountPrice)}</span>
                <span className="text-stone-400 text-xs line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-orange-600 font-bold text-sm">{formatPrice(product.price)}</span>
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
