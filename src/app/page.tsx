import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/landing/HeroSection';
import { SubBanners } from '@/components/landing/SubBanners';
import { FlashSale } from '@/components/landing/FlashSale';
import { CategoryCirclesSection } from '@/components/landing/CategoryCirclesSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { InterBanner } from '@/components/landing/InterBanner';
import { BlogSection } from '@/components/landing/BlogSection';
import { Partners } from '@/components/landing/Partners';

export default async function HomePage() {
  const t = await getTranslations('HomePage');

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
        title={t('newArrivalsTitle')}
        subtitle={t('newArrivalsSubtitle')}
        queryKey="products-new"
        params={{ isNew: true, sortBy: 'newest' }}
        viewAllHref="/products?isNew=true"
      />

      <InterBanner
        badge={t('banner1Badge')}
        title={t('banner1Title')}
        sub={t('banner1Sub')}
        cta={t('banner1Cta')}
        href="/products?isNew=true"
        imageKey="farm"
      />

      <ProductSection
        title={t('fruitsTitle')}
        subtitle={t('fruitsSubtitle')}
        queryKey="products-fruits"
        params={{ search: 'trái cây', sortBy: 'newest' }}
        viewAllHref="/products?search=tr%C3%A1i+c%C3%A2y"
      />

      <InterBanner
        badge={t('banner2Badge')}
        title={t('banner2Title')}
        sub={t('banner2Sub')}
        cta={t('banner2Cta')}
        href="/products?isDiscount=true"
        imageKey="fresh"
      />

      <ProductSection
        title={t('discountTitle')}
        subtitle={t('discountSubtitle')}
        queryKey="products-discount"
        params={{ isDiscount: true, sortBy: 'price_asc' }}
        viewAllHref="/products?isDiscount=true"
      />

      <BlogSection />

      <Partners />
    </Suspense>
  );
}
