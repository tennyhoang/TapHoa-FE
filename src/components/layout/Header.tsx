'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, User, LogOut, Package, Search, MapPin,
  LayoutDashboard, Truck, UserCog, X, ChevronDown, TrendingUp, Phone,
} from 'lucide-react';
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

const HOT_KEYWORDS = [
  'Rau cải sạch',
  'Trái cây tươi',
  'Sữa hữu cơ',
  'Thịt bò Úc',
  'Gạo ST25',
  'Bánh mì nguyên cám',
];

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin, isAgent, isDriver } = useAuthStore();
  const { currentHub, clearHub } = useHubStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hubDialogOpen, setHubDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useAuthStore.persist.rehydrate();
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
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
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    router.push(`/products?search=${encodeURIComponent(keyword)}`);
    setSearch('');
    setShowSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            T
          </span>
          <span className="text-lg font-black text-stone-900 tracking-tight group-hover:text-orange-600 transition-colors">
            TapHoa
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto relative">
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setShowSuggestions(false)}
            placeholder="Tìm sản phẩm bạn cần..."
            className="w-full pl-4 pr-12 py-2 rounded-full text-sm bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300/40 focus:border-orange-400 transition-colors text-stone-800 placeholder-stone-400"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Suggestions dropdown */}
          <div
            onMouseDown={e => e.preventDefault()}
            className={`absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-orange-100 shadow-lg z-50 overflow-hidden transition-all duration-150 origin-top ${
              showSuggestions && !search
                ? 'opacity-100 scale-y-100 pointer-events-auto'
                : 'opacity-0 scale-y-95 pointer-events-none'
            }`}
          >
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-stone-400 tracking-widest uppercase">
              Từ khóa phổ biến
            </p>
            {HOT_KEYWORDS.map(keyword => (
              <button
                key={keyword}
                type="button"
                onClick={() => handleSuggestionClick(keyword)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
              >
                <TrendingUp className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                {keyword}
              </button>
            ))}
          </div>
        </form>

        {/* Hotline */}
        <a href="tel:18006868" className="hidden md:flex items-center gap-1.5 shrink-0 group">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <Phone className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 leading-none">Hotline</p>
            <p className="text-sm font-black text-red-500 leading-tight">1800 6868</p>
          </div>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Cart */}
          <Link href="/cart">
            <button className="relative flex flex-col items-center text-stone-500 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-orange-50">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
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
                <button className="flex flex-col items-center text-stone-500 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-orange-50">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-[10px] hidden sm:block mt-0.5 max-w-[64px] truncate">
                    {user?.fullName?.split(' ').pop()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                  <p className="text-xs text-stone-500 truncate">{user?.email}</p>
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
                      <LayoutDashboard className="mr-2 h-4 w-4 text-orange-600" />
                      <span className="text-orange-600 font-medium">Quản trị</span>
                    </DropdownMenuItem>
                  </>
                )}
                {isAgent() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/agent')}>
                      <UserCog className="mr-2 h-4 w-4 text-amber-600" />
                      <span className="text-amber-600 font-medium">Cổng Agent</span>
                    </DropdownMenuItem>
                  </>
                )}
                {isDriver() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/driver')}>
                      <Truck className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Cổng Tài xế</span>
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
                className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 text-sm h-9 px-3"
                onClick={() => router.push('/auth/login')}
              >
                Đăng nhập
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm h-9 px-4 font-semibold"
                onClick={() => router.push('/auth/register')}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-nav */}
      <div className="bg-orange-50 border-t border-orange-100">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center gap-1">
          <Link href="/" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Trang chủ</Link>
          <Link href="/gioi-thieu" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Giới thiệu</Link>
          <Link href="/products" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Sản phẩm</Link>
          <Link href="/cam-nang" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Cẩm nang</Link>
          <Link href="/lien-he" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0">Liên hệ</Link>
          <Link href="/products?isNew=true" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0 hidden sm:block">Hàng mới</Link>
          <Link href="/products?isDiscount=true" className="text-xs text-stone-500 hover:text-orange-600 transition-colors px-2 py-1 rounded hover:bg-white shrink-0 hidden md:block">Giá tốt</Link>

          <div className="ml-auto shrink-0 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHubDialogOpen(true)}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-orange-600 transition-colors border border-orange-200 hover:border-orange-400 rounded-full px-3 py-1 bg-white hover:bg-orange-50"
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
                className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
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
