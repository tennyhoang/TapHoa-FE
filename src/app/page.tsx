'use client';

import { Suspense } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { SubBanners } from '@/components/landing/SubBanners';
import { FlashSale } from '@/components/landing/FlashSale';
import { CategoryCirclesSection } from '@/components/landing/CategoryCirclesSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { InterBanner } from '@/components/landing/InterBanner';
import { BlogSection } from '@/components/landing/BlogSection';
import { Partners } from '@/components/landing/Partners';

export default function HomePage() {
  return (
    <Suspense>
      {/* Hero: full-width escape from main container padding */}
      <div className="-mx-4 -mt-6">
        <HeroSection />
      </div>

      {/* Sub banners */}
      <SubBanners />

      {/* Flash Sale */}
      <FlashSale />

      {/* Category circles */}
      <div className="bg-white rounded-xl border border-gray-100 mt-6 px-4">
        <CategoryCirclesSection />
      </div>

      {/* Product grid 1: Hàng mới về */}
      <ProductSection
        title="Hải sản mới về"
        queryKey="products-new"
        params={{ isNew: true, sortBy: 'newest' }}
        viewAllHref="/?isNew=true"
      />

      {/* Inter banner 1 */}
      <InterBanner
        badge="Chương trình đặc biệt"
        title="Tôm Hùm Alaska tươi sống"
        sub="Nhập khẩu trực tiếp — chỉ có tại TapHoa"
        cta="Đặt mua ngay"
        href="/?search=t%C3%B4m+h%C3%B9m"
        gradient="from-blue-800 to-cyan-600"
        emoji="🦞"
      />

      {/* Product grid 2: Hải sản đông lạnh */}
      <ProductSection
        title="Hải sản đông lạnh"
        queryKey="products-frozen"
        params={{ search: 'đông lạnh', sortBy: 'newest' }}
        viewAllHref="/?search=%C4%91%C3%B4ng+l%E1%BA%A1nh"
      />

      {/* Inter banner 2 */}
      <InterBanner
        badge="Tiết kiệm đến 30%"
        title="Combo Gia Đình siêu tiết kiệm"
        sub="Giao miễn phí — đảm bảo tươi ngon khi nhận hàng"
        cta="Xem combo"
        href="/"
        gradient="from-teal-800 to-teal-600"
        emoji="🎁"
      />

      {/* Product grid 3: Hải sản nhập khẩu */}
      <ProductSection
        title="Hải sản nhập khẩu"
        queryKey="products-import"
        params={{ isDiscount: true, sortBy: 'price_desc' }}
        viewAllHref="/?isDiscount=true"
      />

      {/* Blog */}
      <BlogSection />

      {/* Partners */}
      <Partners />
    </Suspense>
  );
}
