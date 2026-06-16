'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/user.service';
import { warehouseService, type Warehouse } from '@/services/warehouse.service';
import { AdminUser } from '@/types';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 20;

const ROLE_LABEL: Record<string, string> = {
  Admin: 'Admin',
  Customer: 'Khách hàng',
  Agent: 'Agent',
  Driver: 'Tài xế',
  WarehouseManager: 'Quản Lý Kho',
};

const ROLE_COLOR: Record<string, string> = {
  Admin: 'bg-primary/15 text-primary',
  Customer: 'bg-secondary text-secondary-foreground',
  Agent: 'bg-[oklch(0.95_0.05_55)] text-[var(--amber-dark)]',
  Driver: 'bg-[var(--fresh-light)] text-[var(--fresh)]',
  WarehouseManager: 'bg-violet-100 text-violet-700',
};

const ROLES = ['Customer', 'Admin', 'Agent', 'Driver', 'WarehouseManager'];

// ── Assign Warehouse Dialog ───────────────────────────────────────────────────

function AssignWarehouseDialog({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const targetType = user?.role === 'Driver' ? 'Driver' : 'Manager';
  const initialWarehouseId =
    (user?.role === 'Driver' ? user?.warehouseId : user?.managedWarehouseId) ?? null;
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(initialWarehouseId);

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ['admin-warehouses'],
    queryFn: warehouseService.admin.getAll,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => userService.assignWarehouse(user!.id, selectedWarehouseId, targetType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã cập nhật kho');
      onClose();
    },
    onError: () => toast.error('Gán kho thất bại'),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-violet-600" />
            </div>
            <DialogTitle>Gán kho — {user?.fullName}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs">
              {targetType === 'Driver'
                ? 'Kho xuất phát (Driver)'
                : 'Kho quản lý (WarehouseManager)'}
            </Label>
            <select
              value={selectedWarehouseId ?? ''}
              onChange={e => setSelectedWarehouseId(e.target.value || null)}
              className="w-full h-9 border border-input rounded-md px-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="">— Gỡ gán kho —</option>
              {warehouses
                .filter(w => w.isActive !== false)
                .map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Hủy
          </Button>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ──────────────────────────────────────────────────────────────

function EditUserDialog({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [role, setRole] = useState(user?.role ?? 'Customer');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  if (
    user &&
    fullName !== user.fullName &&
    phone !== (user.phoneNumber ?? '') &&
    role !== user.role
  ) {
    setFullName(user.fullName);
    setPhone(user.phoneNumber ?? '');
    setRole(user.role);
    setIsActive(user.isActive);
  }

  const mutation = useMutation({
    mutationFn: () =>
      userService.update(user!.id, { fullName, phoneNumber: phone, role, isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã cập nhật tài khoản');
      onClose();
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Họ tên</Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Số điện thoại</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="h-9 text-sm"
              placeholder="0912..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vai trò</Label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full h-9 border border-input rounded-md px-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs">Trạng thái</Label>
            <button
              type="button"
              onClick={() => setIsActive(v => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4.5' : 'translate-x-0.5'}`}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              {isActive ? 'Hoạt động' : 'Bị khóa'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Hủy
          </Button>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteUserDialog({
  user,
  open,
  onClose,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => userService.delete(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Đã xóa tài khoản');
      onClose();
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          Bạn có chắc muốn xóa tài khoản{' '}
          <span className="font-semibold text-foreground">{user?.fullName}</span>? Hành động này
          không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-end pt-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Hủy
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [assignWarehouseUser, setAssignWarehouseUser] = useState<AdminUser | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () =>
      userService.getAll({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter || undefined,
      }),
    placeholderData: prev => prev,
  });

  const users = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data ? Math.ceil(totalCount / PAGE_SIZE) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount > 0 ? `${totalCount} người dùng` : 'Đang tải...'}
          </p>
        </div>
      </div>

      {/* Search + Role filter */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['', ...ROLES].map(r => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                roleFilter === r
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
              }`}
            >
              {r ? ROLE_LABEL[r] : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-opacity ${isFetching ? 'opacity-70' : ''}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tên
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  SĐT
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Kho trực thuộc
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    Không tìm thấy người dùng
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {user.fullName?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <span className="font-medium text-sm text-foreground">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/80">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {user.phoneNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs font-medium border-0 ${ROLE_COLOR[user.role] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {ROLE_LABEL[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {user.role === 'Driver'
                        ? (user.warehouseName ?? (
                            <span className="text-xs text-muted-foreground/50">Chưa gán</span>
                          ))
                        : user.role === 'WarehouseManager'
                          ? (user.managedWarehouseName ?? (
                              <span className="text-xs text-muted-foreground/50">Chưa gán</span>
                            ))
                          : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {user.isActive ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-[var(--fresh)]" />
                            <span className="text-sm text-[var(--fresh)] font-medium">
                              Hoạt động
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm text-destructive font-medium">Bị khóa</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {(user.role === 'Driver' || user.role === 'WarehouseManager') && (
                          <button
                            onClick={() => setAssignWarehouseUser(user)}
                            className="px-2 py-1.5 rounded-lg hover:bg-violet-100 text-muted-foreground hover:text-violet-700 transition-colors inline-flex items-center gap-1"
                            title="Gán kho"
                          >
                            <Building2 className="h-4 w-4" />
                            <span className="text-xs hidden sm:inline">Gán kho</span>
                          </button>
                        )}
                        <button
                          onClick={() => setEditUser(user)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteUser(user)}
                          className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-border/40 bg-muted/20">
            <span className="text-xs text-muted-foreground">
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

      <AssignWarehouseDialog
        key={assignWarehouseUser?.id}
        user={assignWarehouseUser}
        open={!!assignWarehouseUser}
        onClose={() => setAssignWarehouseUser(null)}
      />
      <EditUserDialog user={editUser} open={!!editUser} onClose={() => setEditUser(null)} />
      <DeleteUserDialog user={deleteUser} open={!!deleteUser} onClose={() => setDeleteUser(null)} />
    </div>
  );
}
