'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { walletService, WalletTransactionDto } from '@/services/wallet.service';
import { formatDate, formatPrice } from '@/lib/format';

function TransactionRow({ tx }: { tx: WalletTransactionDto }) {
  const isCredit = tx.type === 'Credit';
  return (
    <div className="flex items-start gap-4 px-6 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">{tx.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.createdAt)}</p>
      </div>
      <span
        className="text-sm font-bold tabular-nums shrink-0"
        style={{ color: isCredit ? 'oklch(0.54 0.158 145)' : 'oklch(0.55 0.20 25)' }}
      >
        {isCredit ? '+' : '-'}{formatPrice(tx.amount)}
      </span>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
      <div className="px-6 pt-5 pb-5 border-b border-border/40 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="divide-y divide-border/40">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-4 px-6 py-4">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

type WalletMode = null | 'topup' | 'withdraw';

function AmountPanel({
  mode,
  balance,
  onClose,
  onConfirm,
  isPending,
}: {
  mode: 'topup' | 'withdraw';
  balance: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  isPending: boolean;
}) {
  const [raw, setRaw] = useState('');
  const amount = Number(raw.replace(/\D/g, ''));
  const isTopup = mode === 'topup';
  const insufficient = !isTopup && amount > balance;
  const invalid = amount <= 0 || amount > 50_000_000 || (!isTopup && insufficient);

  const QUICK = isTopup
    ? [50_000, 100_000, 200_000, 500_000]
    : [50_000, 100_000, Math.min(200_000, balance), balance].filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  return (
    <div className="px-6 py-5 border-t border-border/40 space-y-4 bg-card/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">
          {isTopup ? 'Nạp tiền vào ví' : 'Rút tiền từ ví'}
        </p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK.map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setRaw(String(v))}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            {formatPrice(v)}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <Input
          type="text"
          inputMode="numeric"
          value={raw ? formatPrice(amount).replace('₫', '').trim() : ''}
          onChange={e => setRaw(e.target.value)}
          placeholder="Nhập số tiền..."
          className="h-10 text-sm"
        />
        {insufficient && (
          <p className="text-xs text-red-500">Số dư không đủ (hiện có {formatPrice(balance)})</p>
        )}
        {amount > 50_000_000 && (
          <p className="text-xs text-red-500">Tối đa 50.000.000đ</p>
        )}
      </div>

      <Button
        onClick={() => onConfirm(amount)}
        disabled={invalid || isPending}
        className="w-full h-9 text-sm"
        style={{
          background: isTopup ? 'oklch(0.57 0.135 196)' : 'oklch(0.55 0.20 25)',
        }}
      >
        {isPending
          ? 'Đang xử lý...'
          : isTopup
            ? `Nạp ${amount > 0 ? formatPrice(amount) : '...'}`
            : `Rút ${amount > 0 ? formatPrice(amount) : '...'}`}
      </Button>
    </div>
  );
}

export function WalletSection() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<WalletMode>(null);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getWallet,
  });

  const topupMutation = useMutation({
    mutationFn: walletService.topup,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`Đã nạp ${formatPrice(res.amount)} vào ví`);
      setMode(null);
    },
    onError: () => toast.error('Nạp tiền thất bại'),
  });

  const withdrawMutation = useMutation({
    mutationFn: walletService.withdraw,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`Đã rút ${formatPrice(res.amount)} từ ví`);
      setMode(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Rút tiền thất bại');
    },
  });

  if (isLoading) return <WalletSkeleton />;

  const balance = wallet?.balance ?? 0;

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">

      {/* Balance header */}
      <div
        className="px-6 pt-5 pb-5 border-b border-border/40"
        style={{ background: 'oklch(0.97 0.02 196)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'oklch(0.57 0.135 196)' }}
            >
              Ví điện tử
            </p>
            <p
              className="font-editorial font-black mt-1 leading-none"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', color: 'oklch(0.22 0.06 196)' }}
            >
              {formatPrice(balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Tích lũy từ cashback — hoàn 2% mỗi đơn hàng đã nhận thành công
            </p>
          </div>
          <div
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-black tracking-wide"
            style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
          >
            2% Cashback
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setMode(mode === 'topup' ? null : 'topup')}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all"
            style={mode === 'topup'
              ? { background: 'oklch(0.57 0.135 196)', color: 'white' }
              : { background: 'oklch(0.91 0.04 196)', color: 'oklch(0.40 0.12 196)' }
            }
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            Nạp tiền
          </button>
          <button
            onClick={() => setMode(mode === 'withdraw' ? null : 'withdraw')}
            disabled={balance <= 0}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={mode === 'withdraw'
              ? { background: 'oklch(0.55 0.20 25)', color: 'white' }
              : { background: 'oklch(0.96 0.02 25)', color: 'oklch(0.42 0.12 25)' }
            }
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Rút tiền
          </button>
        </div>
      </div>

      {/* Top-up / Withdraw panel */}
      {mode && (
        <AmountPanel
          mode={mode}
          balance={balance}
          onClose={() => setMode(null)}
          onConfirm={amount => {
            if (mode === 'topup') topupMutation.mutate(amount);
            else withdrawMutation.mutate(amount);
          }}
          isPending={topupMutation.isPending || withdrawMutation.isPending}
        />
      )}

      {/* Transaction list */}
      {!wallet || wallet.recentTransactions.length === 0 ? (
        <div className="py-14 text-center space-y-1">
          <p className="text-sm font-semibold text-foreground/60">Chưa có giao dịch nào</p>
          <p className="text-xs text-muted-foreground">
            Hoàn thành đơn hàng đầu tiên để nhận cashback vào ví
          </p>
        </div>
      ) : (
        <>
          <div className="px-6 py-3 border-b border-border/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em]">
              Lịch sử giao dịch gần đây
            </p>
          </div>
          <div className="divide-y divide-border/40">
            {wallet.recentTransactions.map(tx => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
