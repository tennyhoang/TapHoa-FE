import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body
        className="font-sans bg-background text-foreground min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
