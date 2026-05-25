'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
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

export function WalletSection() {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getWallet,
  });

  if (isLoading) return <WalletSkeleton />;

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
              {formatPrice(wallet?.balance ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Tích lũy từ cashback — hoàn 2% mỗi đơn hàng đã nhận thành công
            </p>
          </div>
          <div
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-black tracking-wide"
            style={{
              background: 'oklch(0.57 0.135 196)',
              color: 'white',
            }}
          >
            2% Cashback
          </div>
        </div>
      </div>

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
