import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Truck, Shield, Leaf } from 'lucide-react';
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
      <div className="-mt-6 rounded-2xl overflow-hidden">
        <HeroSection />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-6 mt-4 py-4 sm:py-5 px-3 sm:px-6 border border-border/50 rounded-2xl bg-card">
        {(
          [
            { icon: Truck, label: t('trustBadge1Label'), sub: t('trustBadge1Sub') },
            { icon: Shield, label: t('trustBadge2Label'), sub: t('trustBadge2Sub') },
            { icon: Leaf, label: t('trustBadge3Label'), sub: t('trustBadge3Sub') },
          ]
        ).map((b, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <b.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-[11px] sm:text-sm leading-tight">{b.label}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                {b.sub}
              </p>
            </div>
          </div>
        ))}
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
