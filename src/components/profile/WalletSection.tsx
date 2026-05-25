'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, X, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { walletService, WalletTransactionDto } from '@/services/wallet.service';
import { formatDate, formatPrice } from '@/lib/format';

const BANK_NAME    = 'MB Bank';
const BANK_CODE    = 'MB';
const ACCOUNT_NO   = '0000000001';
const ACCOUNT_NAME = 'TAPHOA TEST';

const VN_BANKS = [
  'Vietcombank (VCB)', 'Vietinbank (CTG)', 'BIDV', 'Agribank',
  'MB Bank', 'Techcombank (TCB)', 'ACB', 'Sacombank (STB)',
  'VPBank', 'TPBank', 'OCB', 'SHB', 'HDBank', 'VIB', 'MSB',
  'SeABank', 'LienVietPostBank (LPB)', 'Nam A Bank', 'DongA Bank', 'BaoViet Bank',
];

// ── Sub-components ────────────────────────────────────────────────────────────

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

// ── QR Panel ─────────────────────────────────────────────────────────────────

function TopupQRPanel({
  paymentRef,
  amount,
  onClose,
}: {
  paymentRef: string;
  amount: number;
  onClose: () => void;
}) {
  const addInfo       = encodeURIComponent(paymentRef);
  const accountNameEnc = encodeURIComponent(ACCOUNT_NAME);
  const qrUrl         = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NO}-compact2.jpg?amount=${amount}&addInfo=${addInfo}&accountName=${accountNameEnc}`;

  const copyRef = () => {
    navigator.clipboard.writeText(paymentRef);
    toast.success('Đã sao chép nội dung chuyển khoản');
  };

  return (
    <div className="border-t border-border/40">
      <div className="bg-teal-600 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Chuyển khoản để nạp ví</p>
          <p className="text-teal-200 text-xs mt-0.5">Hệ thống tự xác nhận sau khi nhận tiền (~1 phút)</p>
        </div>
        <button onClick={onClose} className="text-teal-200 hover:text-white transition-colors p-1 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4 bg-gradient-to-b from-teal-50/60 to-transparent">
        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-2.5 shadow-sm border border-teal-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR nạp ví" className="w-48 h-48 object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-teal-100 overflow-hidden text-sm divide-y divide-stone-50">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-400">Ngân hàng</span>
            <span className="font-semibold text-stone-800">{BANK_NAME}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-400">Số tài khoản</span>
            <span className="font-semibold font-mono text-stone-800">{ACCOUNT_NO}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-stone-400">Số tiền</span>
            <span className="font-black text-teal-600">{formatPrice(amount)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-stone-400">Nội dung CK</span>
            <div className="flex items-center gap-2">
              <span className="font-black font-mono text-teal-700">{paymentRef}</span>
              <button type="button" onClick={copyRef} className="text-teal-400 hover:text-teal-600 transition-colors">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-teal-600 text-center leading-relaxed">
          Nhập đúng nội dung chuyển khoản để hệ thống nhận diện tự động.
        </p>
      </div>
    </div>
  );
}

// ── Topup amount entry ────────────────────────────────────────────────────────

function TopupAmountPanel({
  onConfirm,
  onClose,
  isPending,
}: {
  onConfirm: (amount: number) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [raw, setRaw] = useState('');
  const amount = Number(raw.replace(/\D/g, ''));
  const invalid = amount <= 0 || amount > 50_000_000;

  return (
    <div className="px-6 py-5 border-t border-border/40 space-y-4 bg-card/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Nạp tiền vào ví</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[50_000, 100_000, 200_000, 500_000].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setRaw(String(v))}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 hover:border-teal-400/40 hover:bg-teal-50 transition-colors"
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
        {amount > 50_000_000 && (
          <p className="text-xs text-red-500">Tối đa 50.000.000đ</p>
        )}
      </div>

      <Button
        onClick={() => onConfirm(amount)}
        disabled={invalid || isPending}
        className="w-full h-9 text-sm"
        style={{ background: 'oklch(0.57 0.135 196)' }}
      >
        {isPending ? 'Đang tạo mã...' : `Tạo mã QR${amount > 0 ? ` — ${formatPrice(amount)}` : ''}`}
      </Button>
    </div>
  );
}

// ── Withdraw form ─────────────────────────────────────────────────────────────

function WithdrawPanel({
  balance,
  onClose,
  onConfirm,
  isPending,
  done,
}: {
  balance: number;
  onClose: () => void;
  onConfirm: (data: { amount: number; bankName: string; accountNumber: string; holderName: string }) => void;
  isPending: boolean;
  done: boolean;
}) {
  const [raw, setRaw]               = useState('');
  const [bankName, setBankName]     = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');

  const amount = Number(raw.replace(/\D/g, ''));
  const insufficient = amount > balance;
  const invalid = amount <= 0 || amount > 50_000_000 || insufficient
    || !bankName || !accountNumber.trim() || !holderName.trim();

  const QUICK = [50_000, 100_000, Math.min(200_000, balance), balance]
    .filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  if (done) {
    return (
      <div className="px-6 py-8 border-t border-border/40 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10" style={{ color: 'oklch(0.54 0.158 145)' }} />
        <p className="text-sm font-bold text-foreground">Yêu cầu rút tiền đã được ghi nhận</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Admin sẽ chuyển khoản trong vòng 24 giờ. Ví đã được trừ số tiền này.
        </p>
        <button
          onClick={onClose}
          className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 border-t border-border/40 space-y-4 bg-card/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Rút tiền từ ví</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Số tiền muốn rút</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setRaw(String(v))}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 hover:border-red-300/60 hover:bg-red-50 transition-colors"
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
        </div>
      </div>

      {/* Bank info */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Thông tin ngân hàng nhận</p>
        <select
          value={bankName}
          onChange={e => setBankName(e.target.value)}
          className="w-full h-10 text-sm border border-input rounded-md px-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="">Chọn ngân hàng...</option>
          {VN_BANKS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <Input
          type="text"
          inputMode="numeric"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="Số tài khoản..."
          className="h-10 text-sm font-mono"
        />

        <Input
          type="text"
          value={holderName}
          onChange={e => setHolderName(e.target.value.toUpperCase())}
          placeholder="Tên chủ tài khoản (IN HOA)..."
          className="h-10 text-sm"
        />
      </div>

      <Button
        onClick={() => onConfirm({ amount, bankName, accountNumber, holderName })}
        disabled={invalid || isPending}
        className="w-full h-9 text-sm"
        style={{ background: 'oklch(0.55 0.20 25)' }}
      >
        {isPending ? 'Đang xử lý...' : `Gửi yêu cầu rút${amount > 0 ? ` ${formatPrice(amount)}` : ''}`}
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type WalletMode = null | 'topup' | 'withdraw';

interface TopupQR { paymentRef: string; amount: number; initialBalance: number }

export function WalletSection() {
  const queryClient = useQueryClient();
  const [mode, setMode]         = useState<WalletMode>(null);
  const [topupQR, setTopupQR]   = useState<TopupQR | null>(null);
  const [withdrawDone, setWithdrawDone] = useState(false);
  const prevBalance = useRef<number | undefined>(undefined);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getWallet,
    refetchInterval: topupQR ? 10_000 : false,
  });

  // Detect balance increase while QR is shown → topup confirmed
  useEffect(() => {
    if (topupQR && wallet && prevBalance.current !== undefined && wallet.balance > topupQR.initialBalance) {
      toast.success(`Nạp thành công ${formatPrice(wallet.balance - topupQR.initialBalance)} vào ví!`);
      setTopupQR(null);
      setMode(null);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    }
    prevBalance.current = wallet?.balance;
  }, [wallet?.balance]); // eslint-disable-line react-hooks/exhaustive-deps

  const initiateMutation = useMutation({
    mutationFn: walletService.initiateTopup,
    onSuccess: (res) => {
      setTopupQR({ paymentRef: res.paymentRef, amount: res.amount, initialBalance: wallet?.balance ?? 0 });
    },
    onError: () => toast.error('Không thể tạo mã QR, thử lại'),
  });

  const withdrawMutation = useMutation({
    mutationFn: walletService.createWithdrawRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setWithdrawDone(true);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Rút tiền thất bại');
    },
  });

  if (isLoading) return <WalletSkeleton />;

  const balance = wallet?.balance ?? 0;

  const closePanel = () => {
    setMode(null);
    setTopupQR(null);
    setWithdrawDone(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">

      {/* Balance header */}
      <div className="px-6 pt-5 pb-5 border-b border-border/40" style={{ background: 'oklch(0.97 0.02 196)' }}>
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

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { closePanel(); if (mode !== 'topup') setMode('topup'); }}
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
            onClick={() => { closePanel(); if (mode !== 'withdraw') setMode('withdraw'); }}
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

      {/* Topup: amount entry → then QR */}
      {mode === 'topup' && !topupQR && (
        <TopupAmountPanel
          onClose={closePanel}
          onConfirm={amount => initiateMutation.mutate(amount)}
          isPending={initiateMutation.isPending}
        />
      )}
      {topupQR && (
        <TopupQRPanel
          paymentRef={topupQR.paymentRef}
          amount={topupQR.amount}
          onClose={closePanel}
        />
      )}

      {/* Withdraw: bank info form */}
      {mode === 'withdraw' && (
        <WithdrawPanel
          balance={balance}
          onClose={closePanel}
          onConfirm={data => withdrawMutation.mutate(data)}
          isPending={withdrawMutation.isPending}
          done={withdrawDone}
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
