'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StarRating } from '@/components/shared/StarRating';

export function ProductCard({ product }: { product: Product }) {
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
      <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-[0_4px_24px_oklch(0.57_0.135_196/0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full group">
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
              <span className="bg-[var(--amber)] text-[var(--amber-dark)] text-[10px] font-black px-2 py-0.5 rounded-lg">
                -{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-[var(--orange)] text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg">
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
              <StarRating rating={product.averageRating} size="xs" />
              <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}

          <div className="mt-auto pt-1 flex items-center justify-between gap-2">
            <div>
              {product.discountPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-primary font-black text-base">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-muted-foreground text-xs line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-primary font-black text-base">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary hover:text-white active:scale-90 active:bg-primary active:text-white text-primary flex items-center justify-center transition-all duration-150 shrink-0 disabled:opacity-50"
                aria-label={`Thêm ${product.name} vào giỏ hàng`}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
