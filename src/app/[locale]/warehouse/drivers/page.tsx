'use client';

import { useQuery } from '@tanstack/react-query';
import { Truck, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { warehouseManagerService } from '@/services/warehouse-manager.service';
import { WarehouseDriver } from '@/types';

function DriverCard({ driver }: { driver: WarehouseDriver }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <Truck className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{driver.fullName}</p>
          {driver.isActive ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
              <XCircle className="h-3 w-3" /> Không hoạt động
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{driver.email}</p>
        {driver.phoneNumber && <p className="text-xs text-gray-400">{driver.phoneNumber}</p>}
      </div>

      <div className="text-right shrink-0">
        <div className="flex items-center gap-1.5 justify-end">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700">{driver.activeOrders}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">đơn đang giao</p>
      </div>
    </div>
  );
}

export default function WarehouseDriversPage() {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['warehouse-drivers'],
    queryFn: warehouseManagerService.getDrivers,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Tài xế được phân công</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !drivers?.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Truck className="h-12 w-12 text-gray-200" />
          <p className="text-sm text-gray-400">Chưa có tài xế nào được phân công về kho này</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map(driver => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      )}
    </div>
  );
}
