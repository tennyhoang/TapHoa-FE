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
  const { isAuthenticated } = useAuthStore();
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
    if (mounted && !isAuthenticated()) router.replace('/auth/login');
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

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
      router.push(`/profile/orders/${order.id}`);
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
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">{t('emptyTitle')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('emptyDesc')}</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-8">
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
  const totalAmount = Math.max(0, rawTotal - voucherDiscount);
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
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* ── Left: Cart items ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-teal-600" />
                  <h2 className="font-semibold text-sm text-gray-800">
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

              <div className="divide-y divide-gray-50">
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
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.productName}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {t('perUnit', { price: formatPrice(item.unitPrice) })}
                        </p>
                      </div>

                      {/* Qty stepper */}
                      <div
                        className={`flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 ${isUpdating ? 'opacity-60' : ''}`}
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
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-800 select-none border-x border-gray-200">
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
                          className="w-8 h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 space-y-1.5 min-w-[70px]">
                        <p className="font-bold text-teal-600 text-sm">
                          {formatPrice(item.subtotal)}
                        </p>
                        <button
                          type="button"
                          disabled={isRemoving}
                          onClick={() => removeMutation.mutate(item.productId)}
                          className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
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

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{t('freeShipping')}</span>
            </div>
          </div>

          {/* ── Right: Checkout form ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* 1. Receiver info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('step1')}</h3>
                </div>

                {addresses && addresses.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAddrOpen(v => !v)}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-emerald-700 font-medium"
                    >
                      <BookUser className="h-3.5 w-3.5" />
                      {t('savedAddresses')}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${addrOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {addrOpen && (
                      <div className="absolute z-10 top-full right-0 mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {addresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setValue('receiverName', addr.receiverName, { shouldValidate: true });
                              setValue('phoneNumber', addr.phoneNumber, { shouldValidate: true });
                              setAddrOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-800">
                                {addr.receiverName}
                              </p>
                              {addr.isDefault && (
                                <span className="text-xs text-teal-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                                  {t('default')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{addr.phoneNumber}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
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
                  <Label className="text-xs font-medium text-gray-600">{t('receiverName')}</Label>
                  <Input
                    {...register('receiverName', { required: t('receiverNameRequired') })}
                    placeholder={t('receiverNamePlaceholder')}
                    className="h-9 text-sm"
                  />
                  {errors.receiverName && (
                    <p className="text-xs text-red-500">{errors.receiverName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">{t('phoneNumber')}</Label>
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
                    <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
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
                    currentHub ? 'bg-teal-600 text-white' : 'bg-teal-400 text-white'
                  }`}
                >
                  2
                </span>
                <h3 className="font-semibold text-gray-800 text-sm">{t('step2')}</h3>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {currentHub ? (
                    <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    {currentHub ? (
                      <>
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {currentHub.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {currentHub.address}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-sm text-teal-700">{t('noHubSelected')}</p>
                        <p className="text-xs text-teal-500 mt-0.5">{t('selectHubPrompt')}</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHubDialogOpen(true)}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                    currentHub
                      ? 'bg-white border-emerald-200 text-teal-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                      : 'bg-amber-400 border-amber-400 text-white hover:bg-amber-500'
                  }`}
                >
                  <Pencil className="h-3 w-3" />
                  {currentHub ? t('change') : t('select')}
                </button>
              </div>
            </div>

            {/* 3. Payment method */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h3 className="font-semibold text-gray-800 text-sm">{t('step3')}</h3>
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
                      className={`text-sm font-semibold ${useWalletToggle ? 'text-violet-700' : 'text-gray-600'}`}
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
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          paymentMethod === opt.value ? 'bg-emerald-100' : 'bg-gray-50'
                        }`}
                      >
                        <opt.Icon
                          className={`h-4 w-4 ${paymentMethod === opt.value ? 'text-teal-600' : 'text-gray-400'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold ${paymentMethod === opt.value ? 'text-emerald-700' : 'text-gray-700'}`}
                        >
                          {t(opt.labelKey)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${walletInsufficient ? 'text-red-400' : 'text-gray-400'}`}
                        >
                          {subLabel}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          paymentMethod === opt.value ? 'border-emerald-500' : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Note */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <h3 className="font-semibold text-gray-800 text-sm">{t('orderNoteLabel')}</h3>
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
                rows={2}
                placeholder={t('orderNote')}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {/* 5. Voucher */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
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
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('subtotal', { count: itemCount })}</span>
                  <span className="font-medium text-gray-700">{formatPrice(rawTotal)}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
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

                <div className="flex justify-between text-gray-500">
                  <span>{t('shippingFee')}</span>
                  <span className="text-teal-600 font-medium">{t('free')}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-800">
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

              <Button
                type="submit"
                disabled={createOrderMutation.isPending || !currentHub}
                className="w-full h-12 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {submitLabel()}
              </Button>

              <p className="text-xs text-center text-gray-400">{t('termsAgreement')}</p>
            </div>
          </div>
        </div>
      </form>

      <HubPickerDialog open={hubDialogOpen} onOpenChange={setHubDialogOpen} />
    </div>
  );
}
