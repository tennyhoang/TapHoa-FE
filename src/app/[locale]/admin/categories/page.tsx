'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, ChevronRight, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { categoryService, CategoryPayload } from '@/services/category.service';
import { Category } from '@/types';

type CategoryForm = { name: string; description: string; imageUrl: string; parentId: string };

// ── Form Dialog ───────────────────────────────────────────────────────────────

function CategoryFormDialog({
  category,
  parentCategories,
  onClose,
}: {
  category?: Category;
  parentCategories: Category[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryForm>({
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? '',
      parentId: category?.parentId ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryForm) => {
      const payload: CategoryPayload = {
        name: data.name,
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        parentId: data.parentId || undefined,
      };
      return category
        ? categoryService.update(category.id, payload)
        : categoryService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(category ? 'Cập nhật thành công!' : 'Thêm danh mục thành công!');
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Thao tác thất bại'),
  });

  const parentOptions = parentCategories.filter(c => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-3">
      <div className="space-y-1">
        <Label>Tên danh mục *</Label>
        <Input {...register('name', { required: true })} placeholder="Tên danh mục" />
        {errors.name && <p className="text-xs text-destructive">Vui lòng nhập tên</p>}
      </div>

      <div className="space-y-1">
        <Label>Thuộc danh mục cha</Label>
        <select
          {...register('parentId')}
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Không có (Là danh mục gốc)</option>
          {parentOptions.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              placeholder="Tải ảnh danh mục"
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang lưu...' : category ? 'Cập nhật' : 'Thêm danh mục'}
      </Button>
    </form>
  );
}

// ── Tree row helpers ──────────────────────────────────────────────────────────

function LevelBadge({ isChild }: { isChild: boolean }) {
  return isChild ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
      <ChevronRight className="h-3 w-3" />
      Danh mục con
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--fresh-light)] text-[var(--fresh)] font-medium">
      Danh mục cha
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const treeRows = useMemo<{ cat: Category; isChild: boolean }[]>(() => {
    if (!categories) return [];
    const byId = new Map(categories.map(c => [c.id, c]));
    const parents = categories.filter(c => !c.parentId || !byId.has(c.parentId));
    const children = categories.filter(c => c.parentId && byId.has(c.parentId));
    const childrenByParent = new Map<string, Category[]>();
    for (const child of children) {
      const list = childrenByParent.get(child.parentId!) ?? [];
      list.push(child);
      childrenByParent.set(child.parentId!, list);
    }
    const rows: { cat: Category; isChild: boolean }[] = [];
    for (const parent of parents) {
      rows.push({ cat: parent, isChild: false });
      for (const child of childrenByParent.get(parent.id) ?? []) {
        rows.push({ cat: child, isChild: true });
      }
    }
    return rows;
  }, [categories]);

  const parentCategories = useMemo(() => (categories ?? []).filter(c => !c.parentId), [categories]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm danh mục mới</DialogTitle>
            </DialogHeader>
            <CategoryFormDialog
              parentCategories={parentCategories}
              onClose={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Ảnh</th>
              <th className="text-left px-4 py-3">Tên danh mục</th>
              <th className="text-left px-4 py-3">Cấp độ</th>
              <th className="text-left px-4 py-3">Mô tả</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && !treeRows.length && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chưa có danh mục
                </td>
              </tr>
            )}
            {treeRows.map(({ cat, isChild }) => (
              <tr key={cat.id} className={`hover:bg-muted/50 ${isChild ? 'bg-muted/30' : ''}`}>
                <td className="px-4 py-3">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground">
                      <Tag className="h-4 w-4" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {isChild ? (
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <span className="text-muted-foreground pl-2">└─</span>
                      {cat.name}
                    </span>
                  ) : (
                    <span className="text-foreground">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LevelBadge isChild={isChild} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{cat.description ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => {
                        setEditCategory(cat);
                        setEditOpen(true);
                      }}
                      className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa danh mục "${cat.name}"?`)) deleteMutation.mutate(cat.id);
                      }}
                      className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
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
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryFormDialog
              category={editCategory}
              parentCategories={parentCategories}
              onClose={() => {
                setEditOpen(false);
                setEditCategory(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
