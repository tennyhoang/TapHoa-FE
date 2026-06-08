import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taphoa.vn';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TapHoa — Thực phẩm tươi sạch tận Hub',
    template: '%s | TapHoa',
  },
  description:
    'Rau củ VietGAP, trái cây tươi, thịt cá sạch — đặt online, nhận tại Hub gần nhà bạn.',
  keywords: ['thực phẩm sạch', 'rau củ VietGAP', 'giao hàng tận Hub', 'tạp hóa online'],
  authors: [{ name: 'TapHoa', url: BASE_URL }],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: BASE_URL,
    siteName: 'TapHoa',
    title: 'TapHoa — Thực phẩm tươi sạch tận Hub',
    description:
      'Rau củ VietGAP, trái cây tươi, thịt cá sạch — đặt online, nhận tại Hub gần nhà bạn.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'TapHoa — Thực phẩm tươi sạch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TapHoa — Thực phẩm tươi sạch tận Hub',
    description:
      'Rau củ VietGAP, trái cây tươi, thịt cá sạch — đặt online, nhận tại Hub gần nhà bạn.',
    images: [OG_IMAGE],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body
        className="font-sans bg-background text-foreground min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        {/* Skip-to-content: visible only on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none"
        >
          Đi đến nội dung chính
        </a>

        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Topbar />
            <Header />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 focus:outline-none"
              suppressHydrationWarning
            >
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
