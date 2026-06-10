'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Truck, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/warehouse', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/warehouse/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/warehouse/inventory', label: 'Tồn kho', icon: Package },
  { href: '/warehouse/drivers', label: 'Tài xế', icon: Truck },
];

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isWarehouseManager, isAuthenticated, logout, _hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && _hydrated && (!isAuthenticated() || !isWarehouseManager())) {
      router.replace('/');
    }
  }, [mounted, _hydrated]);

  if (!mounted) return null;
  if (!isAuthenticated() || !isWarehouseManager()) return null;

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="w-56 bg-sidebar flex flex-col shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <span className="font-bold text-sidebar-foreground text-base">Quản lý kho</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname.endsWith('/warehouse')
              : pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
