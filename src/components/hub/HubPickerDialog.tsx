'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { hubService } from '@/services/hub.service';
import { useHubStore, Hub } from '@/store/hub.store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HubPickerDialog({ open, onOpenChange }: Props) {
  const { currentHub, setHub } = useHubStore();

  const { data: hubs, isLoading, isError } = useQuery({
    queryKey: ['hubs-active'],
    queryFn: hubService.getActive,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  function handleSelect(hub: Hub) {
    setHub(hub);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <MapPin className="h-5 w-5" />
            Chọn điểm nhận hàng
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Chọn hub gần bạn nhất để xem sản phẩm và nhận hàng nhanh chóng.
          </p>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
            <AlertCircle className="h-8 w-8 text-red-300" />
            <p className="text-sm">Không thể tải danh sách hub. Vui lòng thử lại.</p>
          </div>
        )}

        {!isLoading && !isError && hubs?.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Hiện chưa có hub nào hoạt động.</p>
        )}

        {!isLoading && !isError && hubs && hubs.length > 0 && (
          <ul className="space-y-2 mt-1">
            {hubs.map(hub => {
              const isSelected = currentHub?.id === hub.id;
              return (
                <li key={hub.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(hub)}
                    className={`w-full text-left rounded-xl border px-4 py-3.5 transition-colors flex items-start gap-3 group
                      ${isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                  >
                    <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
                        {hub.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{hub.address}</p>
                      {hub.phoneNumber && (
                        <p className="text-xs text-gray-400 mt-0.5">{hub.phoneNumber}</p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
