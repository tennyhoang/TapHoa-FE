'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { claimService } from '@/services/claim.service';
import { useAuthStore } from '@/store/auth.store';
import { ClaimType } from '@/types';
import { cn } from '@/lib/utils';

type ClaimOption = { value: ClaimType; label: string; description: string };

const CLAIM_TYPES: ClaimOption[] = [
  {
    value: 'DamagedProduct',
    label: 'Sản phẩm hư hỏng',
    description: 'Hàng bị vỡ, móp méo, hỏng khi nhận',
  },
  {
    value: 'WrongProduct',
    label: 'Sản phẩm sai',
    description: 'Nhận sản phẩm khác so với đơn đặt hàng',
  },
  {
    value: 'MissingProduct',
    label: 'Thiếu sản phẩm',
    description: 'Đơn hàng bị thiếu sản phẩm đã đặt',
  },
  { value: 'LateDelivery', label: 'Giao hàng trễ', description: 'Đơn hàng giao không đúng hẹn' },
  { value: 'Other', label: 'Khác', description: 'Vấn đề khác không có trong danh sách trên' },
];

export default function CreateClaimPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { isAuthenticated, _hydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<ClaimType | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && _hydrated && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted, _hydrated]);

  const createMutation = useMutation({
    mutationFn: () =>
      claimService.create({ orderId, type: selectedType!, description: description.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
      toast.success('Khiếu nại đã được gửi thành công');
      router.replace('/profile/claims');
    },
    onError: () => toast.error('Không thể gửi khiếu nại. Vui lòng thử lại.'),
  });

  const canSubmit = selectedType !== null && description.trim().length >= 10;

  if (!mounted) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gửi khiếu nại</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            Đơn #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Claim type selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700">Loại khiếu nại *</Label>
        <div className="space-y-2">
          {CLAIM_TYPES.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedType(opt.value)}
              className={cn(
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                selectedType === opt.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      selectedType === opt.value ? 'text-emerald-700' : 'text-gray-800'
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3',
                    selectedType === opt.value ? 'border-emerald-500' : 'border-gray-300'
                  )}
                >
                  {selectedType === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">
          Mô tả chi tiết * <span className="text-gray-400 font-normal">(tối thiểu 10 ký tự)</span>
        </Label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Mô tả vấn đề bạn gặp phải..."
          rows={5}
          maxLength={1000}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
        />
        <p className="text-xs text-gray-400 text-right">{description.length}/1000</p>
      </div>

      <Button
        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold"
        onClick={() => createMutation.mutate()}
        disabled={!canSubmit || createMutation.isPending}
      >
        {createMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Gửi khiếu nại
      </Button>

      <p className="text-xs text-center text-gray-400">
        Chúng tôi sẽ xem xét và phản hồi trong vòng 1–3 ngày làm việc
      </p>
    </div>
  );
}
