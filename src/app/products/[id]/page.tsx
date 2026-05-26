'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ShoppingCart, Zap, ArrowLeft, Package, Shield, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { productService } from '@/services/product.service';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate } from '@/lib/format';

const SENTIMENT_LABEL: Record<string, string> = {
  Positive: 'Hài lòng',
  Negative: 'Không hài lòng',
  Neutral:  'Trung tính',
};

const SENTIMENT_CLASS: Record<string, string> = {
  Positive: 'bg-[var(--fresh-light)] text-[var(--fresh)]',
  Negative: 'bg-destructive/10 text-destructive',
  Neutral:  'bg-muted text-muted-foreground',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => productService.getReviews(id),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.add(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng!');
    },
    onError: () => toast.error('Thêm vào giỏ thất bại'),
  });

  const buyNowMutation = useMutation({
    mutationFn: () => cartService.add(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      router.push('/checkout');
    },
    onError: () => toast.error('Không thể thêm vào giỏ hàng'),
  });

  const addReviewMutation = useMutation({
    mutationFn: () => productService.addReview(id, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setComment('');
      setRating(5);
      toast.success('Đã gửi đánh giá! Cảm ơn bạn.');
    },
    onError: (e: Error) => toast.error(e.message ?? 'Không thể gửi đánh giá'),
  });

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }
    buyNowMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="text-center py-24 space-y-3">
      <Package className="h-16 w-16 text-border mx-auto" />
      <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
    </div>
  );

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;

  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.averageRating;

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <ProductImageGallery
          thumbnailUrl={product.thumbnailUrl}
          images={product.images}
          productName={product.name}
          outOfStock={product.stock === 0}
          discountPct={discount}
        />

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-1">{product.categoryName}</p>
            <h1 className="text-2xl font-bold text-foreground leading-snug">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-[var(--amber)] text-[var(--amber)]' : 'text-border'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviews?.length ?? product.reviewCount} đánh giá)</span>
            {(product.soldCount ?? 0) > 0 && (
              <span className="text-sm text-muted-foreground">· Đã bán {product.soldCount}</span>
            )}
          </div>

          {/* Price */}
          <div className="bg-muted border border-border rounded-xl p-4">
            {product.discountPrice ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-4xl font-black text-primary">{formatPrice(product.discountPrice)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-0.5 rounded">
                    -{discount}%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-4xl font-black text-primary">{formatPrice(product.price)}</span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tình trạng:</span>
            {product.stock > 0 ? (
              <span className="text-[var(--fresh)] font-semibold">Còn hàng ({product.stock} sản phẩm)</span>
            ) : (
              <span className="text-destructive font-medium">Hết hàng</span>
            )}
          </div>

          {product.stock > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2.5 hover:bg-muted font-bold text-lg text-muted-foreground transition-colors"
                >
                  −
                </button>
                <span className="px-5 py-2.5 font-bold text-base min-w-[3rem] text-center border-x border-border">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2.5 hover:bg-muted font-bold text-lg text-muted-foreground transition-colors"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || buyNowMutation.isPending}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/5 h-12 text-base font-bold rounded-xl transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={buyNowMutation.isPending || addToCartMutation.isPending}
                className="flex-1 h-12 text-base font-bold rounded-xl"
              >
                <Zap className="h-5 w-5 mr-2" />
                {buyNowMutation.isPending ? 'Đang xử lý...' : 'Mua ngay'}
              </Button>
            </div>
          ) : (
            <Button
              disabled
              className="w-full h-12 text-base font-bold rounded-xl bg-muted text-muted-foreground cursor-not-allowed border border-border shadow-none"
            >
              Hết hàng
            </Button>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck,     label: 'Giao hàng nhanh', sub: 'Toàn quốc'    },
              { icon: Shield,    label: 'Hàng chính hãng', sub: '100% đảm bảo' },
              { icon: RotateCcw, label: 'Đổi trả dễ dàng', sub: 'Trong 7 ngày' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center p-3 bg-muted border border-border/60 rounded-xl">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Reviews */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Đánh giá sản phẩm</h2>
          <span className="text-sm text-muted-foreground">{reviews?.length ?? 0} đánh giá</span>
        </div>

        {reviews && reviews.length > 0 && (
          <div className="bg-muted border border-border rounded-xl p-5 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-black text-primary">{avgRating.toFixed(1)}</div>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-[var(--amber)] text-[var(--amber)]' : 'text-border'}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reviews.length} đánh giá</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-3">{star}</span>
                    <Star className="h-3 w-3 fill-[var(--amber)] text-[var(--amber)]" />
                    <div className="flex-1 bg-border/40 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[var(--amber)] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isAuthenticated() && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="font-semibold text-foreground">Viết đánh giá của bạn</p>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Đánh giá sao</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 ${s <= rating ? 'fill-[var(--amber)] text-[var(--amber)]' : 'text-border hover:text-[var(--amber)]/50'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Nhận xét</p>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              onClick={() => addReviewMutation.mutate()}
              disabled={addReviewMutation.isPending}
              className="px-6"
            >
              {addReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        )}

        {reviews?.length === 0 && (
          <div className="text-center py-10 text-muted-foreground space-y-2">
            <Star className="h-12 w-12 mx-auto text-border" />
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        )}

        <div className="space-y-3">
          {reviews?.map(r => (
            <div key={r.id} className="bg-card border border-border/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {r.userFullName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground leading-none">{r.userFullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt.toString())}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-[var(--amber)] text-[var(--amber)]' : 'text-border'}`} />
                    ))}
                  </div>
                  {r.sentiment && r.sentiment !== 'Neutral' && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SENTIMENT_CLASS[r.sentiment] ?? SENTIMENT_CLASS['Neutral']}`}>
                      {SENTIMENT_LABEL[r.sentiment] ?? r.sentiment}
                    </span>
                  )}
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-foreground/80 leading-relaxed pl-11">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
