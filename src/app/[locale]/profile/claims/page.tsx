'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { claimService } from '@/services/claim.service';
import { useAuthStore } from '@/store/auth.store';
import { Claim, ClaimStatus, ClaimType } from '@/types';

const STATUS_CONFIG: Record<ClaimStatus, { label: string; className: string }> = {
  Pending: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  UnderReview: { label: 'Đang xem xét', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  Resolved: {
    label: 'Đã giải quyết',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Rejected: { label: 'Từ chối', className: 'bg-red-50 text-red-700 border-red-200' },
};

const TYPE_LABEL: Record<ClaimType, string> = {
  DamagedProduct: 'Sản phẩm hư hỏng',
  WrongProduct: 'Sản phẩm sai',
  MissingProduct: 'Thiếu sản phẩm',
  LateDelivery: 'Giao hàng trễ',
  Other: 'Khác',
};

function ClaimCard({ claim }: { claim: Claim }) {
  const statusCfg = STATUS_CONFIG[claim.status];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 font-mono">#{claim.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{TYPE_LABEL[claim.type]}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.className}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{claim.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(claim.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
        <span className="font-mono">Đơn #{claim.orderId.slice(0, 8).toUpperCase()}</span>
      </div>

      {claim.resolution && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700">Kết quả xử lý</p>
          <p className="text-xs text-emerald-600 mt-0.5">{claim.resolution}</p>
        </div>
      )}
    </div>
  );
}

export default function ClaimsPage() {
  const router = useRouter();
  const { isAuthenticated, _hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && _hydrated && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted, _hydrated]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-claims'],
    queryFn: () => claimService.getMyClaims({ pageSize: 50 }),
    enabled: mounted && isAuthenticated(),
  });

  if (!mounted) return null;

  const claims = data?.items ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Khiếu nại của tôi</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-gray-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-700">Chưa có khiếu nại nào</p>
            <p className="text-sm text-gray-400 mt-1">
              Nếu có vấn đề với đơn hàng, bạn có thể gửi khiếu nại từ trang chi tiết đơn hàng
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
