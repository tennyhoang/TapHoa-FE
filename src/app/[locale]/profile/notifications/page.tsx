'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Package, Zap, Tag, Info, ArrowLeft, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  notificationService,
  NotificationDto,
  NotificationType,
} from '@/services/notification.service';
import { formatDate } from '@/lib/format';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  OrderStatus: { icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
  FlashSale: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  Promotion: { icon: Tag, color: 'text-violet-500', bg: 'bg-violet-50' },
  System: { icon: Info, color: 'text-stone-400', bg: 'bg-stone-50' },
};

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-stone-100">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  onTap,
}: {
  item: NotificationDto;
  onTap: (item: NotificationDto) => void;
}) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.System;
  const Icon = cfg.icon;
  const clickable = item.type === 'OrderStatus' && item.data?.orderId;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => onTap(item)}
      onKeyDown={e => e.key === 'Enter' && onTap(item)}
      className={[
        'flex gap-3 px-4 py-3.5 border-b border-stone-100 last:border-0 transition-colors',
        !item.isRead ? 'bg-teal-50/60' : 'bg-white',
        clickable ? 'cursor-pointer hover:bg-stone-50/80' : '',
      ].join(' ')}
    >
      <div
        className={`relative h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${cfg.bg}`}
      >
        <Icon className={`h-5 w-5 ${cfg.color}`} />
        {!item.isRead && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-teal-500 border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${!item.isRead ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'}`}
        >
          {item.title}
        </p>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{item.body}</p>
        <p className="text-[11px] text-stone-400 mt-1">{formatDate(item.createdAt)}</p>
      </div>

      {clickable && (
        <div className="flex items-center shrink-0 self-center">
          <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-stone-300" />
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => notificationService.getAll(pageParam as number, 20),
    getNextPageParam: last => (last.page < last.totalPages ? last.page + 1 : undefined),
    initialPageParam: 1,
    enabled: mounted && isAuthenticated(),
  });

  const notifications: NotificationDto[] = (data?.pages.flatMap(p => p.items) ?? []).map(n =>
    localRead.has(n.id) ? { ...n, isRead: true } : n
  );

  const handleTap = (item: NotificationDto) => {
    if (!item.isRead && !localRead.has(item.id)) {
      notificationService.markRead(item.id).catch(() => {});
      setLocalRead(prev => new Set([...prev, item.id]));
      queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
    }
    if (item.type === 'OrderStatus' && item.data?.orderId) {
      router.push(`/profile/orders/${item.data.orderId}`);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setLocalRead(new Set(notifications.map(n => n.id)));
      queryClient.invalidateQueries({ queryKey: ['notification-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setMarkingAll(false);
    }
  };

  if (!mounted) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-stone-900">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-bold bg-teal-100 text-teal-700 rounded-full px-2 py-0.5">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {markingAll ? 'Đang xử lý...' : 'Đọc tất cả'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Bell className="h-12 w-12 text-stone-200" />
            <p className="text-sm font-semibold text-stone-400">Không có thông báo nào</p>
          </div>
        ) : (
          <>
            {notifications.map(item => (
              <NotificationRow key={item.id} item={item} onTap={handleTap} />
            ))}
            {hasNextPage && (
              <div className="p-4 flex justify-center border-t border-stone-100">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
