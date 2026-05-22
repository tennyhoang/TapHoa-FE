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
        title="Hàng mới về"
        queryKey="products-new"
        params={{ isNew: true, sortBy: 'newest' }}
        viewAllHref="/?isNew=true"
      />

      {/* Inter banner 1 */}
      <InterBanner
        href="/"
        imageUrl="https://res.cloudinary.com/doy14nwx0/image/upload/v1779422936/Screenshot_2026-05-22_110849_snvdyk.png"
        title="Thực phẩm tươi sống"
      />

      {/* Product grid 2: Trái cây tươi */}
      <ProductSection
        title="Trái cây tươi"
        queryKey="products-fruits"
        params={{ search: 'trái cây', sortBy: 'newest' }}
        viewAllHref="/?search=tr%C3%A1i+c%C3%A2y"
      />

      {/* Inter banner 2 */}
      <InterBanner
        badge="Tiết kiệm mỗi ngày"
        title="Thực phẩm tươi sống chất lượng"
        sub="Thịt, cá, trứng, sữa — tươi ngon, giao nhanh"
        cta="Xem ngay"
        href="/"
        gradient="from-blue-800 to-cyan-700"
        emoji="🛒"
      />

      {/* Product grid 3: Giá tốt */}
      <ProductSection
        title="Giá tốt mỗi ngày"
        queryKey="products-discount"
        params={{ isDiscount: true, sortBy: 'price_asc' }}
        viewAllHref="/?isDiscount=true"
      />

      {/* Blog */}
      <BlogSection />

      {/* Partners */}
      <Partners />
    </Suspense>
  );
}
