'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Truck, ChevronRight, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/cart/CartItem';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/auth.store';
import { Cart } from '@/types';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.get,
    enabled: mounted && isAuthenticated(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.update(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData<Cart>(['cart']);
      queryClient.setQueryData<Cart>(['cart'], old => {
        if (!old) return old;
        const items = old.items.map(item =>
          item.productId === productId
            ? { ...item, quantity, subtotal: Number(item.unitPrice) * quantity }
            : item
        );
        return { items, totalAmount: items.reduce((s, i) => s + (Number(i.subtotal) || 0), 0) };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['cart'], ctx.prev);
      toast.error('Cập nhật thất bại');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.remove(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData<Cart>(['cart']);
      queryClient.setQueryData<Cart>(['cart'], old => {
        if (!old) return old;
        const items = old.items.filter(i => i.productId !== productId);
        return { items, totalAmount: items.reduce((s, i) => s + (Number(i.subtotal) || 0), 0) };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['cart'], ctx.prev);
      toast.error('Xóa sản phẩm thất bại');
    },
    onSuccess: () => toast.success('Đã xóa sản phẩm'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearMutation = useMutation({
    mutationFn: cartService.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xóa giỏ hàng');
    },
    onError: () => toast.error('Xóa giỏ hàng thất bại'),
  });

  if (!mounted) return null;

  /* ── Unauthenticated ── */
  if (!isAuthenticated()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Bạn chưa đăng nhập</p>
          <p className="text-sm text-gray-400 mt-1">Đăng nhập để xem giỏ hàng của bạn</p>
        </div>
        <Button
          onClick={() => router.push('/auth/login')}
          className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-8"
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (!cart?.items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Giỏ hàng trống</p>
          <p className="text-sm text-gray-400 mt-1">Thêm sản phẩm vào giỏ để tiếp tục mua sắm</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-8">
          <Link href="/">Khám phá sản phẩm</Link>
        </Button>
      </div>
    );
  }

  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.totalAmount;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Giỏ hàng</h1>
          <span className="text-sm text-gray-400 font-normal">({itemCount} sản phẩm)</span>
        </div>
        <button
          onClick={() => { if (confirm('Xóa toàn bộ giỏ hàng?')) clearMutation.mutate(); }}
          disabled={clearMutation.isPending}
          className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ── Left: item list ── */}
        <div className="space-y-3">
          {cart.items.map(item => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdate={(productId, quantity) => updateMutation.mutate({ productId, quantity })}
              onRemove={(productId) => removeMutation.mutate(productId)}
              updating={updateMutation.isPending && updateMutation.variables?.productId === item.productId}
              removing={removeMutation.isPending && removeMutation.variables === item.productId}
            />
          ))}

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700">
              Miễn phí vận chuyển cho đơn hàng từ{' '}
              <span className="font-semibold">{formatPrice(200000)}</span>
            </p>
          </div>
        </div>

        {/* ── Right: sticky summary ── */}
        <div className="lg:sticky lg:top-6 space-y-3">

          {/* Promo placeholder */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-gray-300 transition-colors">
            <Tag className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-gray-600 flex-1">Nhập mã giảm giá</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </div>

          {/* Summary card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <p className="font-bold text-gray-800 text-base">Tóm tắt đơn hàng</p>

            <div className="space-y-2 text-sm">
              {cart.items.map(item => (
                <div key={item.productId} className="flex justify-between gap-3 text-gray-500">
                  <span className="line-clamp-1 flex-1">
                    {item.productName}
                    <span className="text-gray-400"> ×{item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium text-gray-700">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-medium">Tính khi đặt hàng</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-gray-800">Tổng cộng</span>
              <span className="text-2xl font-black text-emerald-600">{formatPrice(subtotal)}</span>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold rounded-xl transition-colors"
              onClick={() => router.push('/checkout')}
            >
              Đặt hàng ngay
            </Button>

            <p className="text-xs text-center text-gray-400">
              Bằng cách đặt hàng, bạn đồng ý với{' '}
              <Link href="/" className="underline hover:text-emerald-600">điều khoản sử dụng</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
