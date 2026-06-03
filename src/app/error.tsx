'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Đã xảy ra lỗi</h2>
        <p className="text-gray-500">
          Xin lỗi, có điều gì đó không ổn. Vui lòng thử lại.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400">Mã lỗi: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Thử lại</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
