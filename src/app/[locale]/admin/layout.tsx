'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  BookOpen,
  Wallet,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useAdminOrderSocket } from '@/hooks/useAdminOrderSocket';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: Tag },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/flash-sale', label: 'Flash Sale', icon: Zap },
  { href: '/admin/cam-nang', label: 'Cẩm nang', icon: BookOpen },
  { href: '/admin/wallet', label: 'Rút tiền', icon: Wallet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isAuthenticated, logout, _hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useAdminOrderSocket();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && _hydrated && (!isAuthenticated() || !isAdmin())) {
      router.replace('/');
    }
  }, [mounted, _hydrated]);

  if (!mounted) return null;
  if (!isAuthenticated() || !isAdmin()) return null;

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="w-56 bg-sidebar flex flex-col shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <span className="font-editorial font-bold text-sidebar-foreground text-lg">
            TapHoa Admin
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === item.href
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => {
              authService.logout().catch(() => {});
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
