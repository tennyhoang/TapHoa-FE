'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Gift, Package, MapPin } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginResponse } from '@/types';

type FormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const handleSocialLogin = async (provider: 'Google' | 'Facebook', token: string) => {
    setSocialLoading(provider === 'Google' ? 'google' : 'facebook');
    try {
      const res = await authService.socialLogin(provider, token);
      login(res.email, res.fullName, res.role);
      toast.success('Đăng ký / đăng nhập thành công!');
      router.push('/');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(msg ?? `Đăng ký ${provider} thất bại`);
    } finally {
      setSocialLoading(null);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: res => handleSocialLogin('Google', res.access_token),
    onError: () => toast.error('Đăng nhập Google thất bại'),
  });

  const facebookLogin = () => {
    if (typeof window === 'undefined' || !window.FB) {
      toast.error('Facebook SDK chưa tải xong, vui lòng thử lại.');
      return;
    }
    window.FB.login(
      response => {
        if (response.authResponse?.accessToken) {
          handleSocialLogin('Facebook', response.authResponse.accessToken);
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = (await authService.register(
        data.fullName,
        data.email,
        data.password,
        data.phoneNumber || undefined
      )) as LoginResponse;
      login(res.email, res.fullName, res.role);
      toast.success('Đăng ký thành công!');
      router.push('/');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(msg ?? 'Đăng ký thất bại. Email có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  const isSocialLoading = socialLoading !== null;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center -mx-4 -my-6">
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-[0_8px_48px_oklch(0_0_0/0.10)] mx-4 border border-border/60">
        {/* Left panel */}
        <div className="hidden md:flex flex-col w-2/5 relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=85&auto=format&fit=crop"
            alt="Fresh fruits"
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, oklch(0.16 0.040 188 / 0.92), oklch(0.20 0.035 190 / 0.75))',
            }}
          />
          <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
                </svg>
              </div>
              <span className="font-editorial font-black text-xl">TapHoa</span>
            </Link>

            <div>
              <h2 className="font-editorial font-black text-3xl leading-tight mb-3">
                Tạo tài khoản
                <br />
                miễn phí
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Đăng ký ngay để nhận ưu đãi dành riêng cho thành viên mới.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Gift, text: 'Ưu đãi chào mừng thành viên mới' },
                  { icon: Package, text: 'Theo dõi đơn hàng dễ dàng' },
                  { icon: MapPin, text: 'Lưu địa chỉ Hub tiện lợi' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <p.icon className="h-4 w-4 text-white/60 shrink-0" />
                    <span className="text-sm text-white/75">{p.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'oklch(1 0 0 / 0.10)' }}>
              <p className="font-semibold text-sm text-white">Miễn phí đăng ký</p>
              <p className="text-xs text-white/50 mt-0.5">Không mất phí hàng tháng</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-card p-8 md:p-10 flex flex-col justify-center overflow-y-auto max-h-screen">
          <div className="mb-5">
            <h1 className="font-editorial font-black text-2xl text-foreground">
              Đăng ký tài khoản
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Điền thông tin để bắt đầu mua sắm
            </p>
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={isSocialLoading || loading}
              className="flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors font-semibold text-sm text-foreground disabled:opacity-60"
            >
              {socialLoading === 'google' ? (
                <span className="h-4 w-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Tiếp tục với Google
            </button>

            <button
              type="button"
              onClick={facebookLogin}
              disabled={isSocialLoading || loading}
              className="flex items-center justify-center gap-3 h-11 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] transition-colors font-semibold text-sm text-white disabled:opacity-60"
            >
              {socialLoading === 'facebook' ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              Tiếp tục với Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">hoặc đăng ký bằng email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">
                Họ và tên <span className="text-red-400">*</span>
              </Label>
              <Input
                placeholder="Nguyễn Văn A"
                className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Email + Phone in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Email <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                  {...register('email', { required: 'Vui lòng nhập email' })}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Số điện thoại{' '}
                  <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="0912 345 678"
                  className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                  {...register('phoneNumber', {
                    pattern: {
                      value: /^(0|\+84)[3-9]\d{8}$/,
                      message: 'Số điện thoại không hợp lệ (VD: 0912345678)',
                    },
                  })}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Mật khẩu <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 8 ký tự, có chữ và số"
                    className="h-11 pr-10 rounded-xl border-border bg-muted/30 focus:bg-card"
                    {...register('password', {
                      required: 'Vui lòng nhập mật khẩu',
                      pattern: {
                        value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                        message: 'Tối thiểu 8 ký tự, có cả chữ lẫn số',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Xác nhận <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                  {...register('confirmPassword', {
                    validate: v => v === watch('password') || 'Mật khẩu không khớp',
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-1.5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                  {...register('termsAccepted', {
                    required: 'Bạn phải đồng ý với điều khoản sử dụng',
                  })}
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-primary hover:underline font-medium">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                    Chính sách bảo mật
                  </Link>{' '}
                  của TapHoa <span className="text-red-400">*</span>
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs text-red-500">{errors.termsAccepted.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-sm rounded-xl shadow-sm"
              style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
              disabled={loading || isSocialLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
