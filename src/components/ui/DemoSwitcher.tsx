'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, User, ShieldCheck, Store, Truck, Warehouse } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const DEMO_ACCOUNTS = [
  {
    label: 'Khách hàng',
    role: 'User',
    email: 'khach@demo.taphoa.vn',
    password: 'Demo@123456',
    icon: User,
    redirect: '/products',
  },
  {
    label: 'Admin',
    role: 'Admin',
    email: 'admin@demo.taphoa.vn',
    password: 'Demo@123456',
    icon: ShieldCheck,
    redirect: '/admin',
  },
  {
    label: 'Đại lý Hub',
    role: 'Agent',
    email: 'agent@demo.taphoa.vn',
    password: 'Demo@123456',
    icon: Store,
    redirect: '/agent',
  },
  {
    label: 'Tài xế',
    role: 'Driver',
    email: 'driver@demo.taphoa.vn',
    password: 'Demo@123456',
    icon: Truck,
    redirect: '/driver',
  },
  {
    label: 'Quản lý kho',
    role: 'WarehouseManager',
    email: 'kho@demo.taphoa.vn',
    password: 'Demo@123456',
    icon: Warehouse,
    redirect: '/warehouse',
  },
];

export function DemoSwitcher() {
  const [switching, setSwitching] = useState<string | null>(null);
  const { login, user } = useAuthStore();
  const router = useRouter();

  if (!process.env.NEXT_PUBLIC_DEMO_MODE) return null;

  const activeAccount = DEMO_ACCOUNTS.find(a => a.email === user?.email);

  const handleSwitch = async (account: (typeof DEMO_ACCOUNTS)[0]) => {
    if (user?.email === account.email) return;
    setSwitching(account.role);
    try {
      const res = await authService.login(account.email, account.password);
      login(res.email, res.fullName, res.role);
      router.push(account.redirect);
    } catch {
      // ignore — demo account may not exist yet
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="sticky top-0 z-[200] flex flex-wrap items-center justify-center gap-3 border-b border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-medium text-green-800 dark:text-green-400">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
        Demo Mode
        {activeAccount && (
          <span className="ml-1 opacity-70">
            —&nbsp;<strong>{activeAccount.label}</strong>
          </span>
        )}
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {DEMO_ACCOUNTS.map(account => {
          const Icon = account.icon;
          const isActive = user?.email === account.email;
          const isSwitching = switching === account.role;
          return (
            <button
              key={account.role}
              onClick={() => handleSwitch(account)}
              disabled={isSwitching || isActive}
              className={`flex items-center gap-1 rounded px-2 py-1 transition ${
                isActive
                  ? 'cursor-default bg-green-500/20 font-semibold text-green-900 dark:text-green-300'
                  : 'text-green-700/70 hover:bg-green-500/10 hover:text-green-900 dark:text-green-400/70 dark:hover:text-green-300'
              }`}
            >
              {isSwitching ? <RefreshCw size={12} className="animate-spin" /> : <Icon size={12} />}
              {account.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
