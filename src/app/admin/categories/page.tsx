'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { categoryService, CategoryPayload } from '@/services/category.service';
import { Category } from '@/types';

type CategoryForm = { name: string; description: string; imageUrl: string };

function CategoryFormDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, formState: { errors } } = useForm<CategoryForm>({
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryForm) => {
      const payload: CategoryPayload = {
        name: data.name,
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
      };
      return category ? categoryService.update(category.id, payload) : categoryService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(category ? 'Cập nhật thành công!' : 'Thêm danh mục thành công!');
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => toast.error(err?.response?.data?.message ?? err?.message ?? 'Thao tác thất bại'),
  });

  return (
    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-3">
      <div className="space-y-1">
        <Label>Tên danh mục *</Label>
        <Input {...register('name', { required: true })} placeholder="Tên danh mục" />
        {errors.name && <p className="text-xs text-red-500">Vui lòng nhập tên</p>}
      </div>
      <div className="space-y-1">
        <Label>Mô tả</Label>
        <Input {...register('description')} placeholder="Mô tả danh mục" />
      </div>
      <div className="space-y-1">
        <Label>Ảnh danh mục</Label>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <ImageUpload value={field.value} onChange={field.onChange} placeholder="Tải ảnh danh mục" />
          )}
        />
      </div>
      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang lưu...' : category ? 'Cập nhật' : 'Thêm danh mục'}
      </Button>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editCategory, setEditCategory] = useState<Category | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã xóa danh mục');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Xóa thất bại'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" />Thêm danh mục</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm danh mục mới</DialogTitle></DialogHeader>
            <CategoryFormDialog onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Ảnh</th>
              <th className="text-left px-4 py-3">Tên danh mục</th>
              <th className="text-left px-4 py-3">Mô tả</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Đang tải...</td></tr>}
            {!isLoading && !categories?.length && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Chưa có danh mục</td></tr>}
            {categories?.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-lg">🏷️</div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.description ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => { setEditCategory(cat); setEditOpen(true); }}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Xóa danh mục "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                      className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa danh mục</DialogTitle></DialogHeader>
          {editCategory && (
            <CategoryFormDialog
              category={editCategory}
              onClose={() => { setEditOpen(false); setEditCategory(undefined); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
