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
      <div className="-mx-4 -mt-6">
        <HeroSection />
      </div>

      <SubBanners />

      <FlashSale />

      <div className="bg-white rounded-xl border border-gray-100 mt-6 px-4">
        <CategoryCirclesSection />
      </div>

      <ProductSection
        title="Hàng mới về"
        queryKey="products-new"
        params={{ isNew: true, sortBy: 'newest' }}
        viewAllHref="/?isNew=true"
      />

      <InterBanner
        badge="Chương trình đặc biệt"
        title="Rau củ quả tươi sạch VietGAP"
        sub="Trực tiếp từ nông trại — kiểm định chất lượng trước khi giao"
        cta="Đặt mua ngay"
        href="/?isNew=true"
        gradient="from-blue-800 to-cyan-600"
      />

      <ProductSection
        title="Trái cây tươi"
        queryKey="products-fruits"
        params={{ search: 'trái cây', sortBy: 'newest' }}
        viewAllHref="/?search=tr%C3%A1i+c%C3%A2y"
      />

      <InterBanner
        badge="Tiết kiệm mỗi ngày"
        title="Thực phẩm tươi sống chất lượng"
        sub="Thịt, cá, trứng, sữa — tươi ngon, giao nhanh tại Hub gần nhà"
        cta="Xem ngay"
        href="/?isDiscount=true"
        gradient="from-teal-800 to-teal-600"
      />

      <ProductSection
        title="Giá tốt mỗi ngày"
        queryKey="products-discount"
        params={{ isDiscount: true, sortBy: 'price_asc' }}
        viewAllHref="/?isDiscount=true"
      />

      <BlogSection />

      <Partners />
    </Suspense>
  );
}
