'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  warehouseService,
  type Warehouse,
  type WarehousePayload,
} from '@/services/warehouse.service';

const EMPTY: WarehousePayload = {
  name: '',
  address: '',
  ward: '',
  district: '',
  province: '',
  phoneNumber: '',
};

function WarehouseForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: WarehousePayload;
  onSave: (p: WarehousePayload) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<WarehousePayload>(initial);
  const set = (k: keyof WarehousePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const valid =
    form.name.trim() &&
    form.address.trim() &&
    form.ward.trim() &&
    form.district.trim() &&
    form.province.trim();

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Tên kho *</label>
          <Input
            value={form.name}
            onChange={set('name')}
            placeholder="VD: Kho Trung Tâm TP.HCM"
            className="h-9"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Địa chỉ (số nhà, tên đường) *
          </label>
          <Input
            value={form.address}
            onChange={set('address')}
            placeholder="VD: 227 Nguyễn Văn Cừ"
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Phường/Xã *</label>
          <Input
            value={form.ward}
            onChange={set('ward')}
            placeholder="VD: Phường 4"
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Quận/Huyện *</label>
          <Input
            value={form.district}
            onChange={set('district')}
            placeholder="VD: Quận 5"
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tỉnh/Thành phố *</label>
          <Input
            value={form.province}
            onChange={set('province')}
            placeholder="VD: TP.HCM"
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Số điện thoại</label>
          <Input
            value={form.phoneNumber ?? ''}
            onChange={set('phoneNumber')}
            placeholder="VD: 0901234567"
            className="h-9"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(form)} disabled={!valid || loading} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {loading ? 'Đang lưu...' : 'Lưu kho'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </div>
  );
}

export default function AdminWarehousesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Warehouse | null>(null);

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['admin-warehouses'],
    queryFn: warehouseService.admin.getAll,
  });

  const createMutation = useMutation({
    mutationFn: warehouseService.admin.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] });
      setShowForm(false);
      toast.success('Đã tạo kho mới');
    },
    onError: () => toast.error('Tạo kho thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WarehousePayload }) =>
      warehouseService.admin.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] });
      setEditTarget(null);
      toast.success('Đã cập nhật kho');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const toggleMutation = useMutation({
    mutationFn: warehouseService.admin.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] });
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: warehouseService.admin.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-warehouses'] });
      toast.success('Đã xóa kho');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <WarehouseIcon className="h-6 w-6" />
            Quản lý kho
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách kho hàng, tài xế chọn kho xuất phát khi giao hàng
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditTarget(null);
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Thêm kho
          </Button>
        )}
      </div>

      {showForm && (
        <WarehouseForm
          initial={EMPTY}
          onSave={payload => createMutation.mutate(payload)}
          onCancel={() => setShowForm(false)}
          loading={createMutation.isPending}
        />
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : warehouses.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Chưa có kho nào — thêm kho đầu tiên ở trên
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {warehouses.map(w => (
              <div key={w.id} className="px-5 py-4">
                {editTarget?.id === w.id ? (
                  <WarehouseForm
                    initial={{
                      name: w.name,
                      address: w.address,
                      ward: w.ward,
                      district: w.district,
                      province: w.province,
                      phoneNumber: w.phoneNumber,
                    }}
                    onSave={payload => updateMutation.mutate({ id: w.id, payload })}
                    onCancel={() => setEditTarget(null)}
                    loading={updateMutation.isPending}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-foreground">{w.name}</p>
                        {!w.isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                            Tắt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {w.address}, {w.ward}, {w.district}, {w.province}
                      </p>
                      {w.phoneNumber && (
                        <p className="text-xs text-muted-foreground mt-0.5">{w.phoneNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate(w.id)}
                        disabled={toggleMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title={w.isActive ? 'Tắt kho' : 'Bật kho'}
                      >
                        {w.isActive ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditTarget(w);
                          setShowForm(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa kho "${w.name}"?`)) deleteMutation.mutate(w.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
