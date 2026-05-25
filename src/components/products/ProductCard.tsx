'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
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
        className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-[0_4px_24px_oklch(0.57_0.135_196/0.12)] transition-all duration-200 cursor-pointer flex flex-col h-full group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '1/1' }}>
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground font-medium">Chưa có ảnh</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {discount && (
              <span className="bg-[oklch(0.75_0.155_55)] text-[oklch(0.25_0.05_50)] text-[10px] font-black px-2 py-0.5 rounded-lg">
                -{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-[oklch(0.60_0.22_25)] text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                Còn {product.stock}
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center backdrop-blur-[1px]">
              <span className="border border-border text-muted-foreground text-xs font-semibold px-4 py-1.5 rounded-full bg-card">
                Hết hàng
              </span>
            </div>
          )}

          {/* Add to cart — slide up on hover */}
          {product.stock > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 p-2.5 transition-all duration-250"
              style={{
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-60"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 flex flex-col gap-1.5 flex-1">
          <p className="text-sm font-semibold line-clamp-2 leading-snug text-foreground">
            {product.name}
          </p>

          {product.categoryName && (
            <p className="text-[10px] text-muted-foreground font-medium">{product.categoryName}</p>
          )}

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.averageRating) ? 'fill-[oklch(0.75_0.155_55)] text-[oklch(0.75_0.155_55)]' : 'text-border fill-border'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          <div className="mt-auto pt-1">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-primary font-black text-base">{formatPrice(product.discountPrice)}</span>
                <span className="text-muted-foreground text-xs line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="text-primary font-black text-base">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
