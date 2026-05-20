'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Gift } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center -mx-4 -my-6">
      <div className="w-full max-w-4xl flex rounded-xl overflow-hidden border border-gray-200 shadow-sm mx-4">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-emerald-600 p-10 text-white">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-white text-emerald-600 rounded-lg w-9 h-9 flex items-center justify-center font-black text-lg">T</div>
              <span className="text-2xl font-black">TapHoa</span>
            </div>
            <h2 className="text-2xl font-bold leading-snug mb-3">Tạo tài khoản miễn phí!</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Đăng ký ngay để nhận ưu đãi dành riêng cho thành viên mới.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '🎁', text: 'Ưu đãi chào mừng thành viên mới' },
              { icon: '📦', text: 'Theo dõi đơn hàng dễ dàng' },
              { icon: '❤️', text: 'Lưu địa chỉ giao hàng tiện lợi' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-emerald-100">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-white/80" />
              <div>
                <p className="font-semibold text-sm">Miễn phí đăng ký</p>
                <p className="text-xs text-emerald-200">Không mất phí hàng tháng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
            <p className="text-sm text-gray-500 mt-1">Điền thông tin để bắt đầu mua sắm</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Họ và tên</Label>
              <Input
                placeholder="Nguyễn Văn A"
                className="h-11"
                {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-11"
                {...register('email', { required: 'Vui lòng nhập email' })}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 pr-10"
                    {...register('password', {
                      required: 'Vui lòng nhập mật khẩu',
                      minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Xác nhận</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-11"
                  {...register('confirmPassword', {
                    validate: v => v === watch('password') || 'Mật khẩu không khớp',
                  })}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold text-base rounded-lg transition-colors mt-2"
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

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
