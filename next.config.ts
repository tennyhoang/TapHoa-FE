import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'http', hostname: 'localhost', port: '5084', pathname: '/storage/**' },
    ],
  },
};

export default nextConfig;
