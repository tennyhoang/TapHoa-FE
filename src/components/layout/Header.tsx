'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  MapPin,
  LayoutDashboard,
  Truck,
  UserCog,
  Building2,
  X,
  ChevronDown,
  Phone,
  Menu,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useHubStore } from '@/store/hub.store';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { notificationService } from '@/services/notification.service';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HubPickerDialog } from '@/components/hub/HubPickerDialog';
import { HeaderSearchBar } from '@/components/layout/HeaderSearchBar';
import { HeaderMobileMenu } from '@/components/layout/HeaderMobileMenu';

export function Header() {
  const t = useTranslations('Header');
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin, isAgent, isDriver, isWarehouseManager } = useAuthStore();
  const { currentHub, clearHub } = useHubStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hubDialogOpen, setHubDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const HOT_KEYWORDS = t.raw('hotKeywords') as string[];
  const NAV_LINKS = t.raw('navLinks') as { label: string; href: string }[];

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useInactivityLogout();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.get,
    enabled: mounted && isAuthenticated(),
  });

  const { data: notifUnread } = useQuery({
    queryKey: ['notification-unread'],
    queryFn: notificationService.getUnreadCount,
    enabled: mounted && isAuthenticated(),
    refetchInterval: 60_000,
  });

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const unreadCount = notifUnread?.count ?? 0;

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-[68px] flex items-center gap-2 sm:gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
              </svg>
            </div>
            <div className="leading-none">
              <span className="font-editorial font-black text-lg sm:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                TapHoa
              </span>
              <span className="hidden sm:block text-[9px] font-semibold text-muted-foreground tracking-[0.12em] uppercase leading-none mt-0.5">
                {t('logoSub')}
              </span>
            </div>
          </Link>

          <HeaderSearchBar
            search={search}
            onSearchChange={setSearch}
            onSubmit={handleSearch}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setShowSuggestions(false)}
            showSuggestions={showSuggestions}
            hotKeywords={HOT_KEYWORDS}
            onSuggestionClick={handleSuggestionClick}
            searchButtonLabel={t('searchButton')}
            placeholder={t('searchPlaceholder')}
            popularSearchesLabel={t('popularSearches')}
          />

          <a href="tel:18006868" className="hidden lg:flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest leading-none">
                {t('hotline')}
              </p>
              <p className="text-sm font-black text-primary leading-tight mt-0.5">1800 6868</p>
            </div>
          </a>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
              <button className="relative flex flex-col items-center text-muted-foreground hover:text-primary transition-colors p-1.5 sm:p-2 rounded-xl hover:bg-primary/8">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center leading-none">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] hidden sm:block mt-0.5 font-medium">{t('cart')}</span>
              </button>
            </Link>

            {mounted && isAuthenticated() && (
              <Link href="/profile/notifications" onClick={() => setMobileMenuOpen(false)}>
                <button className="relative flex flex-col items-center text-muted-foreground hover:text-primary transition-colors p-1.5 sm:p-2 rounded-xl hover:bg-primary/8">
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] hidden sm:block mt-0.5 font-medium">{t('notifications')}</span>
                </button>
              </Link>
            )}

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
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl shadow-xl border-border/60"
                  >
                    <div className="px-3 py-3">
                      <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/profile')}
                      className="rounded-xl"
                    >
                      <User className="mr-2 h-4 w-4" /> {t('account')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/profile/orders')}
                      className="rounded-xl"
                    >
                      <Package className="mr-2 h-4 w-4" /> {t('orders')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/profile/addresses')}
                      className="rounded-xl"
                    >
                      <MapPin className="mr-2 h-4 w-4" /> {t('addresses')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/profile/notifications')}
                      className="rounded-xl"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      <span className="flex items-center gap-2">
                        {t('notifications')}
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </span>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push('/admin')}
                          className="rounded-xl"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">{t('admin')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAgent() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push('/agent')}
                          className="rounded-xl"
                        >
                          <UserCog className="mr-2 h-4 w-4 text-[var(--amber)]" />
                          <span className="text-[var(--amber-dark)] font-medium">{t('agent')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isDriver() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push('/driver')}
                          className="rounded-xl"
                        >
                          <Truck className="mr-2 h-4 w-4 text-[var(--fresh)]" />
                          <span className="text-[var(--fresh)] font-medium">{t('driver')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isWarehouseManager() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push('/warehouse')}
                          className="rounded-xl"
                        >
                          <Building2 className="mr-2 h-4 w-4 text-violet-500" />
                          <span className="text-violet-700 font-medium">{t('warehouseManager')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive rounded-xl"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/8 text-sm h-9 px-3 rounded-xl"
                    onClick={() => router.push('/auth/login')}
                  >
                    {t('login')}
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9 px-4 font-semibold rounded-xl shadow-sm"
                    onClick={() => router.push('/auth/register')}
                  >
                    {t('register')}
                  </Button>
                </div>
              )}
            </div>

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

        <div className="hidden sm:block border-t border-border/50 bg-background/80 backdrop-blur-sm">
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

            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setHubDialogOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 hover:text-primary transition-colors border border-border hover:border-primary/40 rounded-full px-3 py-1 bg-card hover:bg-primary/6"
              >
                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                <span className="max-w-[180px] truncate">
                  {mounted && currentHub ? currentHub.name : t('pickHub')}
                </span>
                {(!mounted || !currentHub) && (
                  <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                )}
              </button>

              {mounted && currentHub && (
                <button
                  type="button"
                  onClick={clearHub}
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/8"
                  title={t('cancelHub')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <HeaderMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentHub={currentHub}
          mounted={mounted}
          onOpenHubPicker={() => setHubDialogOpen(true)}
          navLinks={NAV_LINKS}
          isAuthenticated={isAuthenticated()}
          user={user}
          onLogout={handleLogout}
          onNavigate={router.push}
          t={t}
        />
      </header>

      <HubPickerDialog open={hubDialogOpen} onOpenChange={setHubDialogOpen} />
    </>
  );
}
