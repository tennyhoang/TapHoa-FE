'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Image from 'next/image';
import { Pencil, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

type ProfileForm = { fullName: string; phoneNumber: string; avatarUrl: string };
type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, login, token, user: storeUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: mounted && isAuthenticated(),
  });

  const profileForm = useForm<ProfileForm>();
  const passwordForm = useForm<PasswordForm>();

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber ?? '',
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      authService.updateProfile({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
        avatarUrl: data.avatarUrl || undefined,
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

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) => authService.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      passwordForm.reset();
    },
    onError: () => toast.error('Mật khẩu hiện tại không đúng'),
  });

  if (!mounted) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tài khoản của tôi</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Thông tin cá nhân</CardTitle>
          {!editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
              className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa thông tin
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!editMode ? (
            /* ── Read-only view ── */
            <div className="space-y-5">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Số điện thoại</p>
                  <p className="text-sm font-medium text-gray-800">{profile?.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Trạng thái</p>
                  <p className="text-sm font-medium text-emerald-600">{profile?.isActive ? 'Hoạt động' : 'Bị khóa'}</p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Edit form ── */
            <form
              onSubmit={profileForm.handleSubmit(data => updateMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label>Họ và tên</Label>
                <Input {...profileForm.register('fullName', { required: true })} />
              </div>
              <div className="space-y-1">
                <Label>Số điện thoại</Label>
                <Input {...profileForm.register('phoneNumber')} placeholder="0912345678" />
              </div>
              <div className="space-y-1">
                <Label>Ảnh đại diện (URL)</Label>
                <Input {...profileForm.register('avatarUrl')} placeholder="https://..." />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    if (profile) {
                      profileForm.reset({
                        fullName: profile.fullName,
                        phoneNumber: profile.phoneNumber ?? '',
                        avatarUrl: profile.avatarUrl ?? '',
                      });
                    }
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader><CardTitle>Đổi mật khẩu</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(data => passwordMutation.mutate(data))} className="space-y-4">
            <div className="space-y-1">
              <Label>Mật khẩu hiện tại</Label>
              <Input type="password" {...passwordForm.register('currentPassword', { required: true })} />
            </div>
            <div className="space-y-1">
              <Label>Mật khẩu mới</Label>
              <Input type="password" {...passwordForm.register('newPassword', { required: true, minLength: 6 })} />
            </div>
            <div className="space-y-1">
              <Label>Xác nhận mật khẩu mới</Label>
              <Input
                type="password"
                {...passwordForm.register('confirmPassword', {
                  validate: v => v === passwordForm.watch('newPassword') || 'Mật khẩu không khớp',
                })}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
