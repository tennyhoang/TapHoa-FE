'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Image from 'next/image';
import { Pencil, User, KeyRound, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

type ProfileForm  = { fullName: string; phoneNumber: string; avatarUrl: string };
type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };

// ── Change Password Dialog ────────────────────────────────────────────────────

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const form = useForm<PasswordForm>();
  const { register, handleSubmit, reset, getValues, formState: { errors } } = form;

  const mutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      reset();
      onOpenChange(false);
    },
    onError: () => toast.error('Mật khẩu hiện tại không đúng'),
  });

  // Reset form whenever dialog is closed
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Đổi mật khẩu
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Mật khẩu hiện tại</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('currentPassword', { required: 'Bắt buộc' })}
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Mật khẩu mới</Label>
            <Input
              type="password"
              placeholder="Ít nhất 6 ký tự"
              {...register('newPassword', { required: 'Bắt buộc', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Xác nhận mật khẩu mới</Label>
            <Input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register('confirmPassword', {
                required: 'Bắt buộc',
                validate: v => v === getValues('newPassword') || 'Mật khẩu không khớp',
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, login, token, user: storeUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pwDialogOpen, setPwDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: mounted && isAuthenticated(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>();

  useEffect(() => {
    if (profile) {
      reset({
        fullName:    profile.fullName,
        phoneNumber: profile.phoneNumber ?? '',
        avatarUrl:   profile.avatarUrl   ?? '',
      });
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      authService.updateProfile({
        fullName:    data.fullName,
        phoneNumber: data.phoneNumber || undefined,
        avatarUrl:   data.avatarUrl   || undefined,
      }),
    onSuccess: (updated) => {
      if (storeUser && token) {
        login(token, storeUser.email, updated.fullName, storeUser.role);
      }
      toast.success('Cập nhật thành công!');
      setEditMode(false);
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      reset({
        fullName:    profile.fullName,
        phoneNumber: profile.phoneNumber ?? '',
        avatarUrl:   profile.avatarUrl   ?? '',
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tài khoản của tôi</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Thông tin cá nhân</CardTitle>
          {!editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
              className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {!editMode ? (
            /* ── Read-only view ── */
            <div className="space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    width={72}
                    height={72}
                    className="rounded-full object-cover border-2 border-emerald-100"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-200">
                    <User className="h-8 w-8 text-emerald-600" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900">{profile?.fullName ?? '—'}</p>
                  <p className="text-sm text-gray-500">{storeUser?.email}</p>
                </div>
              </div>

              {/* Info chips */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Số điện thoại</p>
                  <p className="text-sm font-medium text-gray-800">
                    {profile?.phoneNumber || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Trạng thái</p>
                  <p className="text-sm font-medium text-emerald-600">
                    {profile?.isActive ? 'Hoạt động' : 'Bị khóa'}
                  </p>
                </div>
              </div>

              {/* Change password trigger */}
              <div className="pt-1 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPwDialogOpen(true)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors py-1"
                >
                  <KeyRound className="h-4 w-4" />
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          ) : (
            /* ── Edit form ── */
            <form
              onSubmit={handleSubmit(data => updateMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label>Họ và tên</Label>
                <Input
                  {...register('fullName', { required: 'Bắt buộc' })}
                  autoFocus
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Số điện thoại</Label>
                <Input {...register('phoneNumber')} placeholder="0912 345 678" />
              </div>

              <div className="space-y-1">
                <Label>Ảnh đại diện (URL)</Label>
                <Input {...register('avatarUrl')} placeholder="https://..." />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <ChangePasswordDialog open={pwDialogOpen} onOpenChange={setPwDialogOpen} />
    </div>
  );
}
