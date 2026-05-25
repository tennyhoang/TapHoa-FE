'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';

type WithdrawStatus = 'Pending' | 'Completed' | 'Rejected';

interface WithdrawRequest {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  holderName: string;
  status: WithdrawStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
  userName: string;
  userEmail: string;
}

const STATUS_TABS: { value: WithdrawStatus; label: string }[] = [
  { value: 'Pending',   label: 'Chờ xử lý' },
  { value: 'Completed', label: 'Đã hoàn thành' },
  { value: 'Rejected',  label: 'Đã từ chối' },
];

const statusIcon = (s: WithdrawStatus) => {
  if (s === 'Completed') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (s === 'Rejected')  return <XCircle className="h-4 w-4 text-red-400" />;
  return <Clock className="h-4 w-4 text-amber-500" />;
};

export default function AdminWalletPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<WithdrawStatus>('Pending');
  const [note, setNote] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-withdraw-requests', tab],
    queryFn: () =>
      api.get<WithdrawRequest[]>('/admin/wallet/withdraw-requests', { params: { status: tab } })
        .then(r => r.data),
  });

  const process = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'complete' | 'reject' }) =>
      api.patch(`/admin/wallet/withdraw-requests/${id}/${action}`, { note: note || undefined })
        .then(r => r.data),
    onSuccess: (_, { action }) => {
      toast.success(action === 'complete' ? 'Đã xác nhận hoàn thành' : 'Đã từ chối và hoàn tiền');
      queryClient.invalidateQueries({ queryKey: ['admin-withdraw-requests'] });
      setNote('');
    },
    onError: () => toast.error('Thao tác thất bại'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản lý rút tiền</h1>
        <p className="text-sm text-gray-400 mt-0.5">Xử lý yêu cầu rút tiền từ ví người dùng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.value
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-sm text-gray-400 py-10 text-center">Đang tải...</div>
      )}

      {!isLoading && requests.length === 0 && (
        <div className="text-sm text-gray-400 py-16 text-center">Không có yêu cầu nào</div>
      )}

      <div className="space-y-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {statusIcon(req.status)}
                  <span className="font-bold text-gray-900">{formatPrice(req.amount)}</span>
                  <span className="text-xs text-gray-400 font-mono">{req.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {req.userName} · <span className="text-gray-400">{req.userEmail}</span>
                </p>
                <p className="text-xs text-gray-400">{formatDate(req.createdAt)}</p>
              </div>

              <div className="text-right space-y-1">
                <p className="text-sm font-bold text-gray-800">{req.bankName}</p>
                <p className="text-sm font-mono text-gray-600">{req.accountNumber}</p>
                <p className="text-xs text-gray-500">{req.holderName}</p>
              </div>
            </div>

            {req.adminNote && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
                Ghi chú: {req.adminNote}
              </p>
            )}

            {req.status === 'Pending' && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Ghi chú (tuỳ chọn)..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => process.mutate({ id: req.id, action: 'complete' })}
                    disabled={process.isPending}
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Xác nhận đã chuyển
                  </button>
                  <button
                    onClick={() => process.mutate({ id: req.id, action: 'reject' })}
                    disabled={process.isPending}
                    className="flex-1 h-9 border-2 border-red-200 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Từ chối (hoàn tiền)
                  </button>
                </div>
              </div>
            )}

            {req.processedAt && (
              <p className="text-xs text-gray-400">Xử lý lúc: {formatDate(req.processedAt)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
