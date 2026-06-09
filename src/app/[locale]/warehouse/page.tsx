'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Package,
  CheckCircle2,
  Truck,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { warehouseManagerService } from '@/services/warehouse-manager.service';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  onClick?: () => void;
};

function StatCard({ label, value, icon: Icon, color, bg, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </button>
  );
}

export default function WarehouseDashboardPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-dashboard'],
    queryFn: warehouseManagerService.getDashboard,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-56" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const wh = data?.warehouse;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{wh ? wh.name : 'Kho hàng'}</h1>
        {wh && (
          <p className="text-sm text-gray-400 mt-0.5">
            {wh.address}, {wh.district}, {wh.province}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Đơn chờ đóng gói"
          value={data?.pendingOrders ?? 0}
          icon={Package}
          color="text-amber-600"
          bg="bg-amber-50"
          onClick={() => router.push('/warehouse/orders?status=pending')}
        />
        <StatCard
          label="Đơn đã đóng gói"
          value={data?.packedOrders ?? 0}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50"
          onClick={() => router.push('/warehouse/orders?status=packed')}
        />
        <StatCard
          label="Đơn đang vận chuyển"
          value={data?.shippingOrders ?? 0}
          icon={Truck}
          color="text-blue-600"
          bg="bg-blue-50"
          onClick={() => router.push('/warehouse/orders?status=shipping')}
        />
        <StatCard
          label="Đóng gói hôm nay"
          value={data?.packedToday ?? 0}
          icon={Calendar}
          color="text-violet-600"
          bg="bg-violet-50"
        />
        <StatCard
          label="Tài xế đang hoạt động"
          value={data?.activeDrivers ?? 0}
          icon={Users}
          color="text-cyan-600"
          bg="bg-cyan-50"
          onClick={() => router.push('/warehouse/drivers')}
        />
        <StatCard
          label="Sản phẩm sắp hết"
          value={data?.lowStockProducts ?? 0}
          icon={AlertTriangle}
          color="text-red-600"
          bg="bg-red-50"
          onClick={() => router.push('/warehouse/inventory?filter=low')}
        />
      </div>

      {(data?.pendingOrders ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Có {data?.pendingOrders} đơn hàng đang chờ đóng gói
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Vui lòng xử lý để không ảnh hưởng thời gian giao
            </p>
          </div>
          <button
            onClick={() => router.push('/warehouse/orders?status=pending')}
            className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Xử lý ngay
          </button>
        </div>
      )}
    </div>
  );
}
