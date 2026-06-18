import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Nếu set ALLOWED_EMBED_ORIGINS trong env thì cho phép embed từ các domain đó
// Ví dụ: ALLOWED_EMBED_ORIGINS=https://zylova.vercel.app https://www.zylova.com
const embedOrigins = process.env.ALLOWED_EMBED_ORIGINS
  ? `'self' ${process.env.ALLOWED_EMBED_ORIGINS}`
  : `'self'`;

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '5084', pathname: '/storage/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${embedOrigins}`,
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
