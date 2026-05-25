'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addressService } from '@/services/address.service';
import { useAuthStore } from '@/store/auth.store';
import { Address } from '@/types';

type AddressForm = {
  receiverName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
};

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAll,
    enabled: mounted && isAuthenticated(),
  });

  const addMutation = useMutation({
    mutationFn: (data: AddressForm) =>
      addressService.add({ ...data, isDefault: !addresses?.length }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã thêm địa chỉ');
      setOpen(false);
      reset();
    },
    onError: () => toast.error('Thêm địa chỉ thất bại'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã đặt làm mặc định');
    },
    onError: () => toast.error('Cập nhật địa chỉ mặc định thất bại'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã xóa địa chỉ');
    },
    onError: () => toast.error('Xóa địa chỉ thất bại'),
  });

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Địa chỉ của tôi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" /> Thêm địa chỉ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm địa chỉ mới</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(data => addMutation.mutate(data))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Người nhận</Label>
                  <Input {...register('receiverName', { required: true })} placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-1">
                  <Label>Số điện thoại</Label>
                  <Input {...register('phoneNumber', { required: true })} placeholder="0912345678" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Địa chỉ (số nhà, tên đường)</Label>
                <Input {...register('streetAddress', { required: true })} placeholder="123 Nguyễn Văn Cừ" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Phường/Xã</Label>
                  <Input {...register('ward', { required: true })} placeholder="Phường 1" />
                </div>
                <div className="space-y-1">
                  <Label>Quận/Huyện</Label>
                  <Input {...register('district', { required: true })} placeholder="Quận 5" />
                </div>
                <div className="space-y-1">
                  <Label>Tỉnh/Thành</Label>
                  <Input {...register('province', { required: true })} placeholder="TP.HCM" />
                </div>
              </div>
              {Object.keys(errors).length > 0 && <p className="text-xs text-red-500">Vui lòng điền đầy đủ thông tin</p>}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : !addresses?.length ? (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <MapPin className="h-12 w-12 mx-auto text-gray-300" />
          <p>Bạn chưa có địa chỉ nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: Address) => (
            <div key={addr.id} className="bg-white rounded-lg p-4 shadow-sm flex gap-4 items-start">
              <MapPin className="h-5 w-5 text-emerald-600/60 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm">{addr.receiverName}</span>
                  <span className="text-gray-400 text-sm">|</span>
                  <span className="text-sm text-gray-500">{addr.phoneNumber}</span>
                  {addr.isDefault && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Mặc định</Badge>}
                </div>
                <p className="text-sm text-gray-500">{addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                {!addr.isDefault && (
                  <button onClick={() => setDefaultMutation.mutate(addr.id)} className="text-xs text-emerald-600 hover:underline mt-1">
                    Đặt làm mặc định
                  </button>
                )}
              </div>
              <button onClick={() => removeMutation.mutate(addr.id)} className="text-gray-300 hover:text-red-500 shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
