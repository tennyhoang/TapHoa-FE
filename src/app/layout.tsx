import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Topbar } from '@/components/landing/Topbar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TapHoa — Thực phẩm tươi sạch tận Hub',
  description: 'Rau củ VietGAP, trái cây tươi, thịt cá sạch — đặt online, nhận tại Hub gần nhà bạn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <Topbar />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6" suppressHydrationWarning>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
