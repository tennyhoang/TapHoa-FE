'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, Tag, DollarSign } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPrice, formatDate } from '@/lib/format';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: orders } = useQuery({ queryKey: ['admin-orders', 1, undefined], queryFn: () => orderService.getAllOrders({ page: 1, pageSize: 100 }) });
  const { data: products } = useQuery({ queryKey: ['admin-products-count'], queryFn: () => productService.getAll({ pageSize: 1 }) });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

  const orderList = orders?.items ?? [];
  const revenue = orderList.filter(o => o.status !== OrderStatus.Cancelled).reduce((s, o) => s + o.totalAmount, 0);
  const recentOrders = orderList.slice(0, 8);

  const statusCount = orderList.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Doanh thu" value={formatPrice(revenue)} color="bg-green-500" />
        <StatCard icon={ShoppingBag} label="Đơn hàng" value={String(orders?.totalCount ?? 0)} color="bg-blue-500" />
        <StatCard icon={Package} label="Sản phẩm" value={String(products?.totalCount ?? 0)} color="bg-emerald-600" />
        <StatCard icon={Tag} label="Danh mục" value={String(categories?.length ?? 0)} color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-2">
            {Object.entries(statusCount).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <OrderStatusBadge status={status as OrderStatus} />
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {!orderList.length && <p className="text-sm text-gray-400">Chưa có đơn hàng</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Đơn hàng gần đây</h2>
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-gray-400 ml-2 text-xs">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-medium text-emerald-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            ))}
            {!recentOrders.length && <p className="text-sm text-gray-400">Chưa có đơn hàng</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
