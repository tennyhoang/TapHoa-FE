'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductFormDialog } from '@/components/admin/products/ProductFormDialog';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { formatPrice } from '@/lib/format';
import { Product } from '@/types';

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productService.getAll({ search, page, pageSize: PAGE_SIZE }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Đã xóa sản phẩm');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  function handleSearch() { setSearch(searchInput); setPage(1); }
  function handleEditOpen(product: Product) { setEditProduct(product); setEditOpen(true); }
  function handleEditClose() { setEditOpen(false); setEditProduct(undefined); }

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;
  const cats = categories ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          {data && <p className="text-sm text-muted-foreground mt-0.5">Tổng: {data.totalCount} sản phẩm</p>}
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Thêm sản phẩm mới</DialogTitle></DialogHeader>
            <ProductFormDialog categories={cats} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={handleSearch}>Tìm</Button>
        {search && (
          <Button variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            Xóa lọc
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Sản phẩm</th>
              <th className="text-left px-4 py-3">Danh mục</th>
              <th className="text-right px-4 py-3">Giá</th>
              <th className="text-right px-4 py-3">Tồn kho</th>
              <th className="text-center px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Đang tải...</td></tr>
            )}
            {!isLoading && !data?.items.length && (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">Không có sản phẩm</td></tr>
            )}
            {data?.items.map(p => {
              const isDeleting = deleteMutation.isPending && deleteMutation.variables === p.id;
              return (
                <tr key={p.id} className={`hover:bg-muted/40 transition-opacity ${isDeleting ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        {p.thumbnailUrl ? (
                          <Image src={p.thumbnailUrl} alt={p.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium line-clamp-1">{p.name}</p>
                        {p.discountPrice && <p className="text-xs text-destructive">Giảm giá</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.categoryName}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium">{formatPrice(p.discountPrice ?? p.price)}</p>
                    {p.discountPrice && (
                      <p className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={p.stock === 0
                      ? 'bg-destructive/10 text-destructive border-0'
                      : 'bg-[var(--fresh-light)] text-[var(--fresh)] border-0'}>
                      {p.stock === 0 ? 'Hết hàng' : 'Còn hàng'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleEditOpen(p)}
                        disabled={isDeleting}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Xóa "${p.name}"?`)) deleteMutation.mutate(p.id); }}
                        disabled={isDeleting}
                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</Button>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) handleEditClose(); else setEditOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chỉnh sửa sản phẩm</DialogTitle></DialogHeader>
          {editProduct && (
            <ProductFormDialog key={editProduct.id} product={editProduct} categories={cats} onClose={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
