'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
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
    <html lang="vi">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center gap-6 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Lỗi nghiêm trọng</h1>
            <p className="text-gray-500">Ứng dụng gặp sự cố không mong muốn.</p>
            {error.digest && (
              <p className="text-xs text-gray-400">Mã lỗi: {error.digest}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Thử lại
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
