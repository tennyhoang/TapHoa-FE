'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, User, LogOut, Package, Search, MapPin,
  LayoutDashboard, Truck, UserCog, X, ChevronDown, TrendingUp, Phone, ChevronRight,
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

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Hàng mới', href: '/products?isNew=true' },
  { label: 'Giá tốt', href: '/products?isDiscount=true' },
  { label: 'Cẩm nang', href: '/cam-nang' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
  { label: 'Liên hệ', href: '/lien-he' },
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
    <header className="sticky top-0 z-50 bg-card border-b border-border/60 shadow-[0_1px_12px_oklch(0_0_0/0.06)]">
      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center gap-5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <div className="leading-none">
            <span className="font-editorial font-black text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              TapHoa
            </span>
            <span className="block text-[9px] font-semibold text-muted-foreground tracking-[0.12em] uppercase leading-none mt-0.5">
              Thực phẩm tươi sạch
            </span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[520px] mx-auto relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              placeholder="Tìm rau củ, trái cây, thịt cá..."
              className="w-full pl-10 pr-20 py-2.5 rounded-full text-sm bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all text-foreground placeholder-muted-foreground"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-7 px-4 text-xs font-semibold transition-colors"
            >
              Tìm
            </button>
          </div>

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Suggestions */}
          <div
            onMouseDown={e => e.preventDefault()}
            className={`absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden transition-all duration-150 origin-top ${
              showSuggestions && !search
                ? 'opacity-100 scale-y-100 pointer-events-auto'
                : 'opacity-0 scale-y-95 pointer-events-none'
            }`}
          >
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-muted-foreground tracking-[0.14em] uppercase">
              Tìm kiếm phổ biến
            </p>
            {HOT_KEYWORDS.map(keyword => (
              <button
                key={keyword}
                type="button"
                onClick={() => handleSuggestionClick(keyword)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors text-left"
              >
                <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{keyword}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </form>

        {/* Hotline */}
        <a href="tel:18006868" className="hidden lg:flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest leading-none">Hotline</p>
            <p className="text-sm font-black text-primary leading-tight mt-0.5">1800 6868</p>
          </div>
        </a>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Cart */}
          <Link href="/cart">
            <button className="relative flex flex-col items-center text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-primary/8">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[oklch(0.60_0.22_25)] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] hidden sm:block mt-0.5 font-medium">Giỏ hàng</span>
            </button>
          </Link>

          {/* Auth */}
          {!mounted ? (
            <div className="w-16 h-10" />
          ) : isAuthenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-primary/8">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-[9px] hidden sm:block mt-0.5 max-w-[64px] truncate font-medium">
                    {user?.fullName?.split(' ').pop()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-border/60">
                <div className="px-3 py-3">
                  <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl">
                  <User className="mr-2 h-4 w-4" /> Tài khoản
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/orders')} className="rounded-xl">
                  <Package className="mr-2 h-4 w-4" /> Đơn hàng
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/addresses')} className="rounded-xl">
                  <MapPin className="mr-2 h-4 w-4" /> Địa chỉ
                </DropdownMenuItem>
                {isAdmin() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">Quản trị</span>
                    </DropdownMenuItem>
                  </>
                )}
                {isAgent() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/agent')} className="rounded-xl">
                      <UserCog className="mr-2 h-4 w-4 text-amber-600" />
                      <span className="text-amber-600 font-medium">Cổng Agent</span>
                    </DropdownMenuItem>
                  </>
                )}
                {isDriver() && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/driver')} className="rounded-xl">
                      <Truck className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Cổng Tài xế</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 rounded-xl">
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary hover:bg-primary/8 text-sm h-9 px-3 rounded-xl"
                onClick={() => router.push('/auth/login')}
              >
                Đăng nhập
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9 px-4 font-semibold rounded-xl shadow-sm"
                onClick={() => router.push('/auth/register')}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nav strip */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
          <nav className="flex items-center gap-0.5">
            {NAV_LINKS.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setHubDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 hover:text-primary transition-colors border border-border hover:border-primary/40 rounded-full px-3 py-1 bg-card hover:bg-primary/6"
          >
            <MapPin className="h-3 w-3 shrink-0 text-primary" />
            <span className="max-w-[180px] truncate">
              {mounted && currentHub ? currentHub.name : 'Chọn điểm nhận hàng'}
            </span>
            {(!mounted || !currentHub) && <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />}
          </button>

          {mounted && currentHub && (
            <button
              type="button"
              onClick={clearHub}
              className="ml-1 text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              title="Hủy Hub"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <HubPickerDialog open={hubDialogOpen} onOpenChange={setHubDialogOpen} />
    </header>
  );
}
