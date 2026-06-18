import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const allowedEmbedOrigins = [
  'https://zylova.vercel.app',
  'https://www.zylova.com',
  'https://zylova.com',
].join(' ');

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
          // CSP frame-ancestors takes precedence over X-Frame-Options in modern browsers
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' ${allowedEmbedOrigins}`,
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
