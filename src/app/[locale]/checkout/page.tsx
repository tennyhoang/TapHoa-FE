'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ShoppingBag,
  MapPin,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  CreditCard,
  Wallet,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  BookUser,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { HubPickerDialog } from '@/components/hub/HubPickerDialog';
import { VoucherInput } from '@/components/checkout/VoucherInput';
import { cartService } from '@/services/cart.service';
import { orderService, CreateOrderRequest } from '@/services/order.service';
import { addressService } from '@/services/address.service';
import { walletService } from '@/services/wallet.service';
import { useAuthStore } from '@/store/auth.store';
import { useHubStore } from '@/store/hub.store';
import { Cart, VoucherResponse } from '@/types';
import { formatPrice } from '@/lib/format';

type PaymentMethod = 'COD' | 'BankTransfer' | 'Wallet';

type CheckoutForm = {
  receiverName: string;
  phoneNumber: string;
};

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  labelKey: string;
  subKey: string;
  Icon: React.ElementType;
}[] = [
  { value: 'COD', labelKey: 'codLabel', subKey: 'codSub', Icon: Banknote },
  { value: 'BankTransfer', labelKey: 'bankLabel', subKey: 'bankSub', Icon: CreditCard },
  { value: 'Wallet', labelKey: 'walletLabel', subKey: 'walletSub', Icon: Wallet },
];

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('Checkout');
  const { isAuthenticated, _hydrated } = useAuthStore();
  const { currentHub } = useHubStore();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BankTransfer');
  const [useWalletToggle, setUseWalletToggle] = useState(false);
  const [hubDialogOpen, setHubDialogOpen] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(null);
  const [voucherCode, setVoucherCode] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && _hydrated && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted, _hydrated]);

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.get,
    enabled: mounted && isAuthenticated(),
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getWallet,
    enabled: mounted && isAuthenticated(),
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAll,
    enabled: mounted && isAuthenticated(),
  });

  // ── Optimistic qty update ──────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.update(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData<Cart>(['cart']);
      queryClient.setQueryData<Cart>(['cart'], old => {
        if (!old) return old;
        const items = old.items.map(item =>
          item.productId === productId
            ? { ...item, quantity, subtotal: Number(item.unitPrice) * quantity }
            : item
        );
        return { items, totalAmount: items.reduce((s, i) => s + Number(i.subtotal), 0) };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['cart'], ctx.prev);
      toast.error(t('errorUpdate'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // ── Optimistic remove ──────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.remove(productId),
    onMutate: async productId => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const prev = queryClient.getQueryData<Cart>(['cart']);
      queryClient.setQueryData<Cart>(['cart'], old => {
        if (!old) return old;
        const items = old.items.filter(i => i.productId !== productId);
        return { items, totalAmount: items.reduce((s, i) => s + Number(i.subtotal), 0) };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['cart'], ctx.prev);
      toast.error(t('errorRemove'));
    },
    onSuccess: () => toast.success(t('successRemoved')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // ── Create order ───────────────────────────────────────────────────────────
  const createOrderMutation = useMutation({
    mutationFn: (form: CheckoutForm) => {
      const payload: CreateOrderRequest = {
        hubId: currentHub!.id,
        receiverName: form.receiverName,
        phoneNumber: form.phoneNumber,
        paymentMethod,
        note: note || undefined,
        useWallet: useWalletToggle && hasPartialWallet,
        voucherCode: voucherCode || undefined,
      };
      return orderService.create(payload);
    },
    onSuccess: order => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      router.push(`/checkout/success?orderId=${order.id}&payment=${paymentMethod}`);
    },
    onError: () => toast.error(t('errorCreate')),
  });

  const onSubmit = (form: CheckoutForm) => {
    if (!currentHub) {
      toast.error(t('selectHubRequired'));
      return;
    }
    createOrderMutation.mutate(form);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!mounted) return null;

  if (cartLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{t('emptyTitle')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('emptyDesc')}</p>
        </div>
        <Button asChild className="rounded-lg px-8">
          <Link href="/">{t('emptyCta')}</Link>
        </Button>
      </div>
    );
  }

  const walletBalance = walletData?.balance ?? 0;
  const rawTotal = cart.totalAmount;
  const voucherDiscount = appliedVoucher
    ? appliedVoucher.discountType === 'Percent'
      ? Math.round((rawTotal * appliedVoucher.discountValue) / 100)
      : appliedVoucher.discountValue
    : 0;

  // BR-013: shipping fee based on Hub config
  const hubMinOrder = currentHub?.minimumOrderAmount ?? 50_000;
  const hubFreeShip = currentHub?.freeShippingThreshold ?? 200_000;
  const hubShipFee = currentHub?.shippingFee ?? 15_000;
  const shippingFee = rawTotal >= hubFreeShip ? 0 : hubShipFee;
  const freeShipRemaining = Math.max(0, hubFreeShip - rawTotal);
  const minOrderMet = rawTotal >= hubMinOrder;
  const minOrderRemaining = Math.max(0, hubMinOrder - rawTotal);

  const totalAmount = Math.max(0, rawTotal + shippingFee - voucherDiscount);
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const hasFullWallet = walletBalance >= totalAmount;
  const hasPartialWallet = walletBalance > 0 && walletBalance < totalAmount;

  // When partial wallet toggle is on, clamp to available balance
  const effectiveWalletUsed = useWalletToggle && hasPartialWallet ? walletBalance : 0;
  const remainingAfterWallet = totalAmount - effectiveWalletUsed;

  // Reset wallet toggle if balance changes to cover full amount
  const visibleOptions =
    useWalletToggle && hasPartialWallet
      ? PAYMENT_OPTIONS.filter(o => o.value !== 'Wallet')
      : PAYMENT_OPTIONS;

  const submitLabel = () => {
    if (createOrderMutation.isPending) return t('submitting');
    if (useWalletToggle && hasPartialWallet) {
      return paymentMethod === 'COD'
        ? t('submitCodPartial', { amount: formatPrice(remainingAfterWallet) })
        : t('submitBankPartial', { amount: formatPrice(remainingAfterWallet) });
    }
    if (paymentMethod === 'Wallet') return t('submitWallet', { amount: formatPrice(totalAmount) });
    if (paymentMethod === 'BankTransfer') return t('submitBankTransfer');
    return t('submitCod');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* ── Left: Cart items ── */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm text-foreground">
                    {t('products', { count: itemCount })}
                  </h2>
                </div>
                <Link
                  href="/"
                  className="text-xs text-teal-600 hover:underline flex items-center gap-0.5"
                >
                  {t('addMore')} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-border/40">
                {cart.items.map(item => {
                  const isUpdating =
                    updateMutation.isPending &&
                    updateMutation.variables?.productId === item.productId;
                  const isRemoving =
                    removeMutation.isPending && removeMutation.variables === item.productId;

                  return (
                    <div
                      key={item.productId}
                      className={`flex items-center gap-4 px-5 py-4 transition-opacity ${isRemoving ? 'opacity-40' : ''}`}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-border/60 shrink-0 bg-muted/50">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.productName}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm leading-snug line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('perUnit', { price: formatPrice(item.unitPrice) })}
                        </p>
                      </div>

                      {/* Qty stepper */}
                      <div
                        className={`flex items-center border border-border rounded-lg overflow-hidden shrink-0 ${isUpdating ? 'opacity-60' : ''}`}
                      >
                        <button
                          type="button"
                          disabled={item.quantity <= 1 || isUpdating}
                          onClick={() =>
                            updateMutation.mutate({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-foreground select-none border-x border-border">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            updateMutation.mutate({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 space-y-1.5 min-w-[70px]">
                        <p className="font-bold text-primary text-sm">
                          {formatPrice(item.subtotal)}
                        </p>
                        <button
                          type="button"
                          disabled={isRemoving}
                          onClick={() => removeMutation.mutate(item.productId)}
                          className="text-muted-foreground/50 hover:text-destructive transition-colors disabled:opacity-30"
                          aria-label={t('removeItem')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-primary/8 border border-primary/15 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>{t('freeShipping')}</span>
            </div>
          </div>

          {/* ── Right: Checkout form ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* 1. Receiver info */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-semibold text-foreground text-sm">{t('step1')}</h3>
                </div>

                {addresses && addresses.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAddrOpen(v => !v)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      <BookUser className="h-3.5 w-3.5" />
                      {t('savedAddresses')}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${addrOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {addrOpen && (
                      <div className="absolute z-10 top-full right-0 mt-1.5 w-72 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        {addresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setValue('receiverName', addr.receiverName, { shouldValidate: true });
                              setValue('phoneNumber', addr.phoneNumber, { shouldValidate: true });
                              setAddrOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-border/40 last:border-0 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {addr.receiverName}
                              </p>
                              {addr.isDefault && (
                                <span className="text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                                  {t('default')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{addr.phoneNumber}</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                              {addr.streetAddress}, {addr.ward}, {addr.district}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{t('receiverName')}</Label>
                  <Input
                    {...register('receiverName', { required: t('receiverNameRequired') })}
                    placeholder={t('receiverNamePlaceholder')}
                    className="h-9 text-sm"
                  />
                  {errors.receiverName && (
                    <p className="text-xs text-destructive">{errors.receiverName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{t('phoneNumber')}</Label>
                  <Input
                    {...register('phoneNumber', {
                      required: t('phoneNumberRequired'),
                      pattern: { value: /^[0-9]{9,11}$/, message: t('phoneNumberInvalid') },
                    })}
                    placeholder={t('phoneNumberPlaceholder')}
                    inputMode="tel"
                    className="h-9 text-sm"
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Hub picker */}
            <div
              className={`rounded-xl border-2 p-4 transition-colors ${
                currentHub ? 'border-teal-500 bg-teal-50' : 'border-teal-200 bg-teal-50/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    currentHub ? 'bg-primary text-primary-foreground' : 'bg-primary/50 text-primary-foreground'
                  }`}
                >
                  2
                </span>
                <h3 className="font-semibold text-foreground text-sm">{t('step2')}</h3>
              </div>

              {!currentHub && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                  Hub là điểm nhận hàng gần nhà bạn — thay thế giao tận nơi.{' '}
                  <Link href="/faq" className="underline hover:text-primary">Tìm hiểu thêm</Link>
                </p>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${currentHub ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="min-w-0">
                    {currentHub ? (
                      <>
                        <p className="font-semibold text-sm text-foreground truncate">
                          {currentHub.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {currentHub.address}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-sm text-foreground">{t('noHubSelected')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t('selectHubPrompt')}</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHubDialogOpen(true)}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                    currentHub
                      ? 'bg-card border-border text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary'
                      : 'bg-[var(--amber)] border-[var(--amber)] text-[var(--amber-dark)] hover:opacity-90'
                  }`}
                >
                  <Pencil className="h-3 w-3" />
                  {currentHub ? t('change') : t('select')}
                </button>
              </div>
            </div>

            {/* 3. Payment method */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h3 className="font-semibold text-foreground text-sm">{t('step3')}</h3>
              </div>

              {/* Partial wallet toggle — shown when 0 < balance < totalAmount */}
              {hasPartialWallet && (
                <button
                  type="button"
                  onClick={() => setUseWalletToggle(v => !v)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    useWalletToggle
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/40'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      useWalletToggle ? 'bg-violet-100' : 'bg-gray-50'
                    }`}
                  >
                    <Wallet
                      className={`h-4 w-4 ${useWalletToggle ? 'text-violet-600' : 'text-gray-400'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${useWalletToggle ? 'text-violet-700' : 'text-muted-foreground'}`}
                    >
                      {t('useWalletBalance')}
                    </p>
                    <p className="text-xs mt-0.5 text-gray-400">
                      {useWalletToggle
                        ? t('walletToggleDesc', {
                            balance: formatPrice(walletBalance),
                            remaining: formatPrice(remainingAfterWallet),
                          })
                        : `${t('deductFromWallet')} ${formatPrice(walletBalance)}`}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                      useWalletToggle ? 'bg-violet-500 border-violet-500' : 'border-gray-300'
                    }`}
                  >
                    {useWalletToggle && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              )}

              {/* Payment options */}
              <div className="space-y-2">
                {visibleOptions.map(opt => {
                  const isWalletOpt = opt.value === 'Wallet';
                  const walletInsufficient = isWalletOpt && !hasFullWallet;
                  const isDisabled = walletInsufficient;
                  const subLabel = isWalletOpt
                    ? `${t('walletBalance', { balance: formatPrice(walletBalance) })}${walletInsufficient ? ` — ${t('walletInsufficient')}` : ''}`
                    : useWalletToggle && hasPartialWallet && opt.value !== 'Wallet'
                      ? opt.value === 'COD'
                        ? t('codPartialSub', { amount: formatPrice(remainingAfterWallet) })
                        : t('bankPartialSub', { amount: formatPrice(remainingAfterWallet) })
                      : t(opt.subKey);

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && setPaymentMethod(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        paymentMethod === opt.value
                          ? 'border-primary bg-primary/8'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          paymentMethod === opt.value ? 'bg-primary/15' : 'bg-muted/50'
                        }`}
                      >
                        <opt.Icon
                          className={`h-4 w-4 ${paymentMethod === opt.value ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold ${paymentMethod === opt.value ? 'text-primary' : 'text-foreground'}`}
                        >
                          {t(opt.labelKey)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${walletInsufficient ? 'text-destructive' : 'text-muted-foreground'}`}
                        >
                          {subLabel}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          paymentMethod === opt.value ? 'border-primary' : 'border-border'
                        }`}
                      >
                        {paymentMethod === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Note */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <h3 className="font-semibold text-foreground text-sm">{t('orderNoteLabel')}</h3>
              </div>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors bg-background"
                rows={2}
                placeholder={t('orderNote')}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {/* 5. Voucher */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
                  5
                </span>
                <h3 className="font-semibold text-gray-800 text-sm">Mã giảm giá</h3>
              </div>
              <VoucherInput
                appliedVoucher={appliedVoucher}
                onApply={(voucher, code) => {
                  setAppliedVoucher(voucher);
                  setVoucherCode(code);
                }}
                onRemove={() => {
                  setAppliedVoucher(null);
                  setVoucherCode('');
                }}
                cartTotal={rawTotal}
              />
            </div>

            {/* 6. Summary + Submit */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('subtotal', { count: itemCount })}</span>
                  <span className="font-medium text-foreground">{formatPrice(rawTotal)}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="flex items-center gap-1.5">Mã giảm giá ({voucherCode})</span>
                    <span className="font-semibold">-{formatPrice(voucherDiscount)}</span>
                  </div>
                )}

                {/* Wallet deduction row */}
                {useWalletToggle && hasPartialWallet && (
                  <div className="flex justify-between text-violet-600">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      {t('deductFromWallet')}
                    </span>
                    <span className="font-semibold">-{formatPrice(walletBalance)}</span>
                  </div>
                )}
                {paymentMethod === 'Wallet' && hasFullWallet && (
                  <div className="flex justify-between text-violet-600">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      {t('payFromWallet')}
                    </span>
                    <span className="font-semibold">-{formatPrice(totalAmount)}</span>
                  </div>
                )}

                {/* BR-013: shipping fee */}
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('shippingFee')}</span>
                  {shippingFee === 0 ? (
                    <span className="text-primary font-medium">{t('free')}</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shippingFee)}</span>
                  )}
                </div>

                {/* BR-013: free shipping progress */}
                {freeShipRemaining > 0 && minOrderMet && (
                  <p className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                    🚴 Mua thêm <strong>{formatPrice(freeShipRemaining)}</strong> để được miễn phí
                    ship
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-foreground">
                  {useWalletToggle && hasPartialWallet ? t('needToPayMore') : t('total')}
                </span>
                <span
                  className={`text-2xl font-black ${
                    useWalletToggle && hasPartialWallet ? 'text-orange-500' : 'text-teal-600'
                  }`}
                >
                  {formatPrice(
                    useWalletToggle && hasPartialWallet ? remainingAfterWallet : totalAmount
                  )}
                </span>
              </div>

              {!currentHub && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {t('noHubWarning')}
                </p>
              )}

              {/* BR-013: minimum order warning */}
              {currentHub && !minOrderMet && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Đơn tối thiểu <strong className="ml-1">{formatPrice(hubMinOrder)}</strong>
                  <span className="mx-1">—</span>
                  cần thêm <strong className="ml-1">{formatPrice(minOrderRemaining)}</strong>
                </p>
              )}

              <Button
                type="submit"
                disabled={createOrderMutation.isPending || !currentHub || !minOrderMet}
                className="w-full h-12 text-base font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {submitLabel()}
              </Button>

              <p className="text-xs text-center text-muted-foreground">{t('termsAgreement')}</p>
            </div>
          </div>
        </div>
      </form>

      <HubPickerDialog open={hubDialogOpen} onOpenChange={setHubDialogOpen} />
    </div>
  );
}
