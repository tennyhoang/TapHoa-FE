'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginResponse } from '@/types';

type FormData = { fullName: string; email: string; password: string; confirmPassword: string };

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.register(data.fullName, data.email, data.password) as LoginResponse;
      login(res.accessToken, res.email, res.fullName, res.role);
      toast.success('Đăng ký thành công!');
      router.push('/');
    } catch {
      toast.error('Đăng ký thất bại. Email có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

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
            style={{ background: 'linear-gradient(160deg, oklch(0.16 0.040 188 / 0.92), oklch(0.20 0.035 190 / 0.75))' }}
          />
          <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="font-editorial font-black text-xl">TapHoa</span>
            </Link>

            <div>
              <h2 className="font-editorial font-black text-3xl leading-tight mb-3">
                Tạo tài khoản<br />miễn phí
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Đăng ký ngay để nhận ưu đãi dành riêng cho thành viên mới.
              </p>
              <div className="space-y-3">
                {[
                  { icon: '🎁', text: 'Ưu đãi chào mừng thành viên mới' },
                  { icon: '📦', text: 'Theo dõi đơn hàng dễ dàng' },
                  { icon: '📍', text: 'Lưu địa chỉ Hub tiện lợi' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-sm text-white/75">{p.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: 'oklch(1 0 0 / 0.10)' }}
            >
              <p className="font-semibold text-sm text-white">Miễn phí đăng ký</p>
              <p className="text-xs text-white/50 mt-0.5">Không mất phí hàng tháng</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-card p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-7">
            <h1 className="font-editorial font-black text-2xl text-foreground">Đăng ký tài khoản</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Điền thông tin để bắt đầu mua sắm</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Họ và tên</Label>
              <Input
                placeholder="Nguyễn Văn A"
                className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 pr-10 rounded-xl border-border bg-muted/30 focus:bg-card"
                    {...register('password', {
                      required: 'Vui lòng nhập mật khẩu',
                      minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
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
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Xác nhận</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-muted/30 focus:bg-card"
                  {...register('confirmPassword', {
                    validate: v => v === watch('password') || 'Mật khẩu không khớp',
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-sm rounded-xl shadow-sm mt-2"
              style={{ background: 'oklch(0.57 0.135 196)', color: 'white' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : 'Tạo tài khoản'}
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
