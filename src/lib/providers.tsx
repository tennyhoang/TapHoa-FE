'use client';

import Script from 'next/script';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/sonner';

// Augment window type for Facebook SDK
declare global {
  interface Window {
    FB: {
      init: (opts: object) => void;
      login: (cb: (res: { authResponse?: { accessToken: string } }) => void, opts?: object) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  }));

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>

      {/* Facebook SDK */}
      {FB_APP_ID && (
        <Script
          id="fb-sdk"
          src="https://connect.facebook.net/vi_VN/sdk.js"
          onLoad={() => {
            window.FB.init({ appId: FB_APP_ID, xfbml: false, version: 'v21.0' });
          }}
        />
      )}
    </GoogleOAuthProvider>
  );
}
