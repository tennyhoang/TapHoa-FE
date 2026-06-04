'use client';

import { MapPin, ChevronDown, User, Package, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NavLink {
  label: string;
  href: string;
}
interface UserInfo {
  fullName?: string;
  email?: string;
}
interface Hub {
  id: string;
  name: string;
  address: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentHub: Hub | null;
  mounted: boolean;
  onOpenHubPicker: () => void;
  navLinks: NavLink[];
  isAuthenticated: boolean;
  user: UserInfo | null;
  onLogout: () => void;
  onNavigate: (href: string) => void;
  t: (key: string) => string;
}

export function HeaderMobileMenu({
  isOpen,
  onClose,
  currentHub,
  mounted,
  onOpenHubPicker,
  navLinks,
  isAuthenticated,
  user,
  onLogout,
  onNavigate,
  t,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden border-t border-border/60 bg-card shadow-lg">
      <div className="px-4 py-3 border-b border-border/40">
        <button
          type="button"
          onClick={() => {
            onOpenHubPicker();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground/80 hover:border-primary/40 transition-colors"
        >
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="flex-1 text-left truncate">
            {mounted && currentHub ? currentHub.name : t('pickHub')}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      <nav className="px-4 py-3 grid grid-cols-2 gap-1.5">
        {navLinks.map(item => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/8 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-4 border-t border-border/40 pt-3">
        {!mounted ? null : isAuthenticated ? (
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
              { label: t('account'), icon: User, href: '/profile' },
              { label: t('orders'), icon: Package, href: '/profile/orders' },
              { label: t('addresses'), icon: MapPin, href: '/profile/addresses' },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => {
                  onNavigate(href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-primary hover:bg-primary/8 transition-colors"
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/8 transition-colors"
            >
              <LogOut className="h-4 w-4" /> {t('logout')}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10"
              onClick={() => {
                onNavigate('/auth/login');
                onClose();
              }}
            >
              {t('login')}
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground rounded-xl h-10 font-semibold"
              onClick={() => {
                onNavigate('/auth/register');
                onClose();
              }}
            >
              {t('register')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
