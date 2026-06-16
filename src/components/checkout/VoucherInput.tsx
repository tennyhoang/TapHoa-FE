'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { voucherService } from '@/services/voucher.service';
import { VoucherResponse } from '@/types';
import { formatPrice } from '@/lib/format';

interface VoucherInputProps {
  appliedVoucher: VoucherResponse | null;
  onApply: (voucher: VoucherResponse, code: string) => void;
  onRemove: () => void;
  cartTotal: number;
}

export function VoucherInput({ appliedVoucher, onApply, onRemove, cartTotal }: VoucherInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    const code = inputValue.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }
    setLoading(true);
    try {
      const voucher = await voucherService.validate(code);
      onApply(voucher, code);
      setInputValue('');
      const discountText =
        voucher.discountType === 'Percent'
          ? `${voucher.discountValue}%`
          : formatPrice(voucher.discountValue);
      toast.success(`Áp dụng voucher thành công — giảm ${discountText}`);
    } catch {
      toast.error('Mã voucher không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  if (appliedVoucher) {
    const discountText =
      appliedVoucher.discountType === 'Percent'
        ? `${appliedVoucher.discountValue}%`
        : formatPrice(appliedVoucher.discountValue);
    const saved =
      appliedVoucher.discountType === 'Percent'
        ? (cartTotal * appliedVoucher.discountValue) / 100
        : appliedVoucher.discountValue;

    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--fresh-light)] border border-[var(--fresh)]/25 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-[var(--fresh)]/15 flex items-center justify-center shrink-0">
          <Tag className="h-4 w-4 text-[var(--fresh)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{appliedVoucher.code}</p>
          <p className="text-xs text-[var(--fresh)] mt-0.5">
            Giảm {discountText} — tiết kiệm {formatPrice(saved)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-[var(--fresh)]/20 transition-colors"
          aria-label="Xoá voucher"
        >
          <X className="h-4 w-4 text-[var(--fresh)]" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={inputValue}
        onChange={e => setInputValue(e.target.value.toUpperCase())}
        placeholder="Nhập mã voucher (nếu có)"
        className="h-9 text-sm"
        disabled={loading}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApply())}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleApply}
        disabled={loading || !inputValue.trim()}
        className="shrink-0 gap-1.5 border-[var(--fresh)]/35 text-[var(--fresh)] hover:bg-[var(--fresh)]/8"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Áp dụng
      </Button>
    </div>
  );
}
