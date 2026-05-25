'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Tag, ShoppingBag, Users, BookOpen, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Sản phẩm',     icon: Package         },
  { href: '/admin/categories', label: 'Danh mục',     icon: Tag             },
  { href: '/admin/orders',     label: 'Đơn hàng',     icon: ShoppingBag     },
  { href: '/admin/users',      label: 'Người dùng',   icon: Users           },
  { href: '/admin/cam-nang',   label: 'Cẩm nang',     icon: BookOpen        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated() || !isAdmin())) {
      router.replace('/');
    }
  }, [mounted]);

  if (!mounted) return null;
  if (!isAuthenticated() || !isAdmin()) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-700">
          <span className="font-bold text-white text-lg">TapHoa Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === item.href
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
