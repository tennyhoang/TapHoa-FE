# Changelog

All notable changes to **TapHoa Frontend** will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- PWA support: service worker (`@serwist/next`), `manifest.json`, `robots.txt`
- `next-sitemap` — auto-generated sitemap on build
- Open Graph + Twitter Card metadata (base layout + per-page)
- Vercel Analytics + Speed Insights
- Prettier, Husky, lint-staged, commitlint
- `loading.tsx` skeleton for all 17 routes
- `Dockerfile` + `.dockerignore` for containerized deployment
- Error boundaries: `error.tsx`, `global-error.tsx`, `not-found.tsx`
- Sentry error monitoring

### Changed

- Home page (`page.tsx`) converted to Server Component
- `checkout/success/page.tsx` wrapper converted to Server Component
- `Header.tsx` split into `HeaderSearchBar` + `HeaderMobileMenu` sub-components
- All i18n complete: checkout, HeroSection, InterBanner, HomePage, LoginPage

### Fixed

- Removed hardcoded fallback values for Cloudinary and BANK_INFO

## [1.0.0] - 2026-01-01

### Added

- Initial release
- Product listing, detail, search, cart, checkout, order tracking
- Auth: login (email + Google + Facebook), register
- Profile: orders, addresses, wallet
- Admin dashboard: products, categories, orders, flash sale, users
- Agent and Driver portals
- Flash sale countdown
- Articles / Cẩm nang section
- i18n (vi/en) with next-intl
