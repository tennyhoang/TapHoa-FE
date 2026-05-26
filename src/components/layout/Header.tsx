'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, User, LogOut, Package, Search, MapPin,
  LayoutDashboard, Truck, UserCog, X, ChevronDown, TrendingUp, Phone, ChevronRight, Menu,
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

const HOT_KEYWORDS = ['Rau cải sạch', 'Trái cây tươi', 'Sữa hữu cơ', 'Thịt bò Úc', 'Gạo ST25', 'Bánh mì nguyên cám'];

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleLogout = () => { logout(); router.push('/'); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    router.push(`/products?search=${encodeURIComponent(keyword)}`);
    setSearch('');
    setShowSuggestions(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border/60 shadow-[0_1px_12px_oklch(0_0_0/0.06)]">
        {/* Main row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-[68px] flex items-center gap-2 sm:gap-5">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
              </svg>
            </div>
            <div className="leading-none">
              <span className="font-editorial font-black text-lg sm:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                TapHoa
              </span>
              <span className="hidden sm:block text-[9px] font-semibold text-muted-foreground tracking-[0.12em] uppercase leading-none mt-0.5">
                Thực phẩm tươi sạch
              </span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="Tìm sản phẩm..."
                className="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-full text-sm bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-card transition-all text-foreground placeholder-muted-foreground"
              />
              <button
                type="submit"
                className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-6 sm:h-7 px-2.5 sm:px-4 text-xs font-semibold transition-colors"
              >
                Tìm
              </button>
            </div>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-14 sm:right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
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

          {/* Hotline — desktop only */}
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
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Cart */}
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
              <button className="relative flex flex-col items-center text-muted-foreground hover:text-primary transition-colors p-1.5 sm:p-2 rounded-xl hover:bg-primary/8">
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

            {/* Auth — desktop */}
            <div className="hidden sm:block">
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
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl"><User className="mr-2 h-4 w-4" /> Tài khoản</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile/orders')} className="rounded-xl"><Package className="mr-2 h-4 w-4" /> Đơn hàng</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile/addresses')} className="rounded-xl"><MapPin className="mr-2 h-4 w-4" /> Địa chỉ</DropdownMenuItem>
                    {isAdmin() && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-xl"><LayoutDashboard className="mr-2 h-4 w-4 text-primary" /><span className="text-primary font-medium">Quản trị</span></DropdownMenuItem></>)}
                    {isAgent() && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push('/agent')} className="rounded-xl"><UserCog className="mr-2 h-4 w-4 text-[var(--amber)]" /><span className="text-[var(--amber-dark)] font-medium">Cổng Agent</span></DropdownMenuItem></>)}
                    {isDriver() && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push('/driver')} className="rounded-xl"><Truck className="mr-2 h-4 w-4 text-[var(--fresh)]" /><span className="text-[var(--fresh)] font-medium">Cổng Tài xế</span></DropdownMenuItem></>)}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive rounded-xl"><LogOut className="mr-2 h-4 w-4" /> Đăng xuất</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-1.5">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/8 text-sm h-9 px-3 rounded-xl" onClick={() => router.push('/auth/login')}>
                    Đăng nhập
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9 px-4 font-semibold rounded-xl shadow-sm" onClick={() => router.push('/auth/register')}>
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(o => !o)}
              className="sm:hidden p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop nav strip */}
        <div className="hidden sm:block border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
            <nav className="flex items-center gap-0.5">
              {NAV_LINKS.map(item => (
                <Link key={item.label} href={item.href}
                  className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/8 rounded-lg transition-colors">
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
              <button type="button" onClick={clearHub} className="ml-1 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/8" title="Hủy Hub">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border/60 bg-card shadow-lg">
            {/* Hub picker */}
            <div className="px-4 py-3 border-b border-border/40">
              <button
                type="button"
                onClick={() => { setHubDialogOpen(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground/80 hover:border-primary/40 transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="flex-1 text-left truncate">
                  {mounted && currentHub ? currentHub.name : 'Chọn điểm nhận hàng'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="px-4 py-3 grid grid-cols-2 gap-1.5">
              {NAV_LINKS.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/8 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth — mobile */}
            <div className="px-4 pb-4 border-t border-border/40 pt-3">
              {!mounted ? null : isAuthenticated() ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  {[
                    { label: 'Tài khoản', icon: User, href: '/profile' },
                    { label: 'Đơn hàng', icon: Package, href: '/profile/orders' },
                    { label: 'Địa chỉ', icon: MapPin, href: '/profile/addresses' },
                  ].map(({ label, icon: Icon, href }) => (
                    <button key={label} onClick={() => { router.push(href); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-primary hover:bg-primary/8 transition-colors">
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/8 transition-colors">
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-10" onClick={() => { router.push('/auth/login'); setMobileMenuOpen(false); }}>
                    Đăng nhập
                  </Button>
                  <Button className="flex-1 bg-primary text-primary-foreground rounded-xl h-10 font-semibold" onClick={() => { router.push('/auth/register'); setMobileMenuOpen(false); }}>
                    Đăng ký
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <HubPickerDialog open={hubDialogOpen} onOpenChange={setHubDialogOpen} />
    </>
  );
}
