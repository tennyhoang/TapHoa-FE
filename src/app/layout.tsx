import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TapHoa - Mua sắm online',
  description: 'Nền tảng thương mại điện tử TapHoa - Mua sắm thả ga, giá cả hợp lý',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6" suppressHydrationWarning>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
