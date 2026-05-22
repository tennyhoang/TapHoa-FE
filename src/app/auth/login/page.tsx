'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

type FormData = { email: string; password: string };

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
      } else if (status === 409) {
        toast.error('Lỗi kết nối đến máy chủ, vui lòng thử lại');
      } else {
        toast.error(msg ?? 'Đăng nhập thất bại, vui lòng thử lại');
      }
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
            <h2 className="text-2xl font-bold leading-snug mb-3">Chào mừng quay trở lại!</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Đăng nhập để tiếp tục mua sắm và theo dõi đơn hàng của bạn.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Giao hàng nhanh toàn quốc',
              'Hàng nghìn sản phẩm chất lượng',
              'Thanh toán an toàn, bảo mật',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                <span className="text-sm text-emerald-100">{text}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-semibold text-sm">Hơn 10,000 sản phẩm</p>
            <p className="text-xs text-emerald-200 mt-0.5">đang chờ bạn khám phá</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-sm text-gray-500 mt-1">Nhập thông tin tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Mật khẩu</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
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

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold text-base rounded-lg transition-colors"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
