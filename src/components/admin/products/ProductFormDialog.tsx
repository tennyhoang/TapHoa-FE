'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { productService, ProductPayload } from '@/services/product.service';
import { Product } from '@/types';

type ProductForm = {
  name: string;
  description: string;
  price: number;
  discountPrice: number | '';
  stock: number;
  thumbnailUrl: string;
  categoryId: string;
};

interface Props {
  product?: Product;
  categories: { id: string; name: string }[];
  onClose: () => void;
}

export function ProductFormDialog({ product, categories, onClose }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductForm>({
    defaultValues: product ? {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      discountPrice: product.discountPrice ?? '',
      stock: product.stock,
      thumbnailUrl: product.thumbnailUrl ?? '',
      categoryId: product.categoryId,
    } : { stock: 0, discountPrice: '', thumbnailUrl: '', description: '', categoryId: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => {
      const payload: ProductPayload = {
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        discountPrice: data.discountPrice !== '' ? Number(data.discountPrice) : undefined,
        stock: Number(data.stock),
        thumbnailUrl: data.thumbnailUrl || undefined,
        images: [],
        categoryId: data.categoryId,
      };
      return product ? productService.update(product.id, payload) : productService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(product ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!');
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => toast.error(err?.response?.data?.message ?? err?.message ?? 'Thao tác thất bại'),
  });

  return (
    <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Tên sản phẩm *</Label>
          <Input {...register('name', { required: true })} placeholder="Tên sản phẩm" />
          {errors.name && <p className="text-xs text-red-500">Bắt buộc</p>}
        </div>

        <div className="space-y-1">
          <Label>Giá gốc (VND) *</Label>
          <Input type="number" min={0} {...register('price', { required: true, min: 0 })} />
          {errors.price && <p className="text-xs text-red-500">Bắt buộc</p>}
        </div>
        <div className="space-y-1">
          <Label>Giá khuyến mãi</Label>
          <Input type="number" min={0} {...register('discountPrice', { min: 0 })} placeholder="Để trống nếu không có" />
        </div>

        <div className="space-y-1">
          <Label>Tồn kho *</Label>
          <Input type="number" min={0} {...register('stock', { required: true, min: 0 })} />
          {errors.stock && <p className="text-xs text-red-500">Bắt buộc</p>}
        </div>
        <div className="space-y-1">
          <Label>Danh mục *</Label>
          <select
            {...register('categoryId', { required: true })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Chọn danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500">Bắt buộc</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Ảnh thumbnail</Label>
          <Controller
            name="thumbnailUrl"
            control={control}
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} placeholder="Tải ảnh sản phẩm" />
            )}
          />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Mô tả</Label>
          <textarea
            {...register('description')}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Mô tả sản phẩm..."
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang lưu...' : product ? 'Cập nhật' : 'Thêm sản phẩm'}
      </Button>
    </form>
  );
}
