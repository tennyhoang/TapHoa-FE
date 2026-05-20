'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, Package, Search, MapPin, LayoutDashboard, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useHubStore } from '@/store/hub.store';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HubPickerDialog } from '@/components/hub/HubPickerDialog';

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const { currentHub, clearHub } = useHubStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [hubDialogOpen, setHubDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setMounted(true);
  }, []);
  useInactivityLogout();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.get,
    enabled: mounted && isAuthenticated(),
  });

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* ── Main row ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-base">
            T
          </span>
          <span className="text-lg font-black text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">
            TapHoa
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm bạn cần..."
            className="w-full pl-10 pr-10 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Cart */}
          <Link href="/cart">
            <button className="relative flex flex-col items-center text-gray-500 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-gray-50">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] hidden sm:block mt-0.5">Giỏ hàng</span>
            </button>
          </Link>

          {/* Auth */}
          {!mounted ? (
            <div className="w-16 h-10" />
          ) : isAuthenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center text-gray-500 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-[10px] hidden sm:block mt-0.5 max-w-[64px] truncate">{user?.fullName?.split(' ').pop()}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" /> Tài khoản
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/orders')}>
                  <Package className="mr-2 h-4 w-4" /> Đơn hàng
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/addresses')}>
                  <MapPin className="mr-2 h-4 w-4" /> Địa chỉ
                </DropdownMenuItem>
                {isAdmin() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Quản trị</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 text-sm h-9 px-3"
                onClick={() => router.push('/auth/login')}
              >
                Đăng nhập
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 font-semibold"
                onClick={() => router.push('/auth/register')}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-nav ── */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center gap-1">
          <Link href="/" className="text-xs text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Trang chủ</Link>
          <Link href="/?isNew=true" className="text-xs text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Hàng mới</Link>
          <Link href="/?isDiscount=true" className="text-xs text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Giá tốt mỗi ngày</Link>
          <Link href="/profile/orders" className="text-xs text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Đơn hàng</Link>

          <div className="ml-auto shrink-0 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHubDialogOpen(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors border border-gray-200 hover:border-emerald-300 rounded-full px-3 py-1 bg-white hover:bg-emerald-50"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="max-w-[160px] truncate">
                {mounted && currentHub ? currentHub.name : 'Chọn điểm nhận hàng'}
              </span>
              {(!mounted || !currentHub) && <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />}
            </button>
            {mounted && currentHub && (
              <button
                type="button"
                onClick={clearHub}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                title="Hủy chọn Hub"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <HubPickerDialog open={hubDialogOpen} onOpenChange={setHubDialogOpen} />
    </header>
  );
}
