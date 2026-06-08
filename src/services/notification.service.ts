import api from '@/lib/api';

export type NotificationType = 'OrderStatus' | 'FlashSale' | 'Promotion' | 'System';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export interface PagedNotifications {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const notificationService = {
  getAll: (page = 1, pageSize = 20) =>
    api.get<PagedNotifications>('/notifications', { params: { page, pageSize } }).then(r => r.data),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`, {}).then(() => {}),

  markAllRead: () => api.patch('/notifications/read-all', {}).then(() => {}),

  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
};
