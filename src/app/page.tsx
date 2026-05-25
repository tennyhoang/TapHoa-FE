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

      <div className="bg-card rounded-3xl border border-border/60 mt-6 px-4">
        <CategoryCirclesSection />
      </div>

      <ProductSection
        title="Hàng mới về"
        subtitle="Thu hoạch sáng — có mặt tại Hub trong ngày"
        queryKey="products-new"
        params={{ isNew: true, sortBy: 'newest' }}
        viewAllHref="/products?isNew=true"
      />

      <InterBanner
        badge="Chứng nhận VietGAP"
        title="Rau củ quả tươi sạch từ nông trại"
        sub="Kiểm định chất lượng từng lô hàng trước khi đến tay bạn — minh bạch nguồn gốc."
        cta="Đặt mua ngay"
        href="/products?isNew=true"
        imageKey="farm"
      />

      <ProductSection
        title="Trái cây tươi"
        subtitle="Nhập khẩu và nội địa, nguồn gốc rõ ràng"
        queryKey="products-fruits"
        params={{ search: 'trái cây', sortBy: 'newest' }}
        viewAllHref="/products?search=tr%C3%A1i+c%C3%A2y"
      />

      <InterBanner
        badge="Tiết kiệm mỗi ngày"
        title="Thực phẩm tươi sống chất lượng"
        sub="Thịt, cá, trứng, sữa — tươi ngon, nhận nhanh tại Hub gần nhà bạn."
        cta="Xem giá tốt"
        href="/products?isDiscount=true"
        imageKey="fresh"
      />

      <ProductSection
        title="Giá tốt mỗi ngày"
        subtitle="Ưu đãi cập nhật liên tục, không cần chờ flash sale"
        queryKey="products-discount"
        params={{ isDiscount: true, sortBy: 'price_asc' }}
        viewAllHref="/products?isDiscount=true"
      />

      <BlogSection />

      <Partners />
    </Suspense>
  );
}
