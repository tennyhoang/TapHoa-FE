'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userService, AdminUser } from '@/services/user.service';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 20;

const ROLE_LABEL: Record<string, string> = {
  Admin:    'Admin',
  Customer: 'Khách hàng',
};

const ROLE_COLOR: Record<string, string> = {
  Admin:    'bg-purple-100 text-purple-800',
  Customer: 'bg-blue-100 text-blue-800',
};

function UserRow({ user }: { user: AdminUser }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-gray-400 select-all">{user.id.slice(-8).toUpperCase()}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
            {user.fullName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="font-medium text-sm text-gray-800">{user.fullName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
      <td className="px-4 py-3">
        <Badge className={`text-xs font-medium border-0 ${ROLE_COLOR[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
          {ROLE_LABEL[user.role] ?? user.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {user.isActive ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 font-medium">Hoạt động</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-600 font-medium">Bị khóa</span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(user.createdAt)}</td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn:  () => userService.getAll({ page, pageSize: PAGE_SIZE, search: search || undefined }),
    placeholderData: prev => prev,
  });

  const users      = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data ? Math.ceil(totalCount / PAGE_SIZE) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalCount > 0 ? `${totalCount} người dùng` : 'Đang tải...'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400">
                        <Users className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                        Không tìm thấy người dùng
                      </td>
                    </tr>
                  )
                  : users.map(user => <UserRow key={user.id} user={user} />)
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-gray-50/40">
            <span className="text-xs text-gray-500">
              Trang {page} / {totalPages} — {totalCount} kết quả
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="h-8 text-xs"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-8 text-xs"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
