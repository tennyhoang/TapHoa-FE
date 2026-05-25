'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Leaf, Zap, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

type FormData = { email: string; password: string };

const TRUST_POINTS = [
  { icon: Leaf, text: 'Rau củ VietGAP — kiểm định từng lô hàng' },
  { icon: Zap, text: 'Đặt sáng — nhận chiều tại Hub gần nhà' },
  { icon: ShieldCheck, text: 'Thanh toán bảo mật qua VietQR' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.login(data.email, data.password);
      login(res.accessToken, res.email, res.fullName, res.role);
      toast.success('Đăng nhập thành công!');
      router.push('/');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401 || status === 404) {
        toast.error(msg ?? 'Email hoặc mật khẩu không đúng');
      } else {
        toast.error(msg ?? 'Đăng nhập thất bại, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center -mx-4 -my-6">
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-[0_8px_48px_oklch(0_0_0/0.10)] mx-4 border border-border/60">

        {/* Left: editorial panel */}
        <div className="hidden md:flex flex-col w-2/5 relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=85&auto=format&fit=crop"
            alt="Fresh vegetables"
            fill
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, oklch(0.16 0.040 188 / 0.92), oklch(0.20 0.035 190 / 0.75))' }}
          />
          <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-10">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
                    <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
                  </svg>
                </div>
                <span className="font-editorial font-black text-xl">TapHoa</span>
              </Link>

              <h2 className="font-editorial font-black text-3xl leading-tight mb-3">
                Chào mừng<br />quay trở lại
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Đăng nhập để tiếp tục mua sắm thực phẩm tươi sạch và theo dõi đơn hàng.
              </p>
            </div>

            <div className="space-y-4">
              {TRUST_POINTS.map((point, i) => (
                <div key={i} className="flex items-center gap-3">
                  <point.icon className="h-4 w-4 text-white/60 shrink-0" />
                  <span className="text-sm text-white/75">{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 bg-card p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="font-editorial font-black text-2xl text-foreground">Đăng nhập</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Nhập thông tin tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                {...register('email', { required: 'Vui lòng nhập email' })}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Mật khẩu</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                  {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-sm rounded-xl shadow-sm"
              style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
