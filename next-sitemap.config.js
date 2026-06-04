/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://taphoa.vn',
  generateRobotsTxt: false, // robots.txt đã tạo tay
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/admin*',
    '/agent*',
    '/driver*',
    '/profile*',
    '/checkout*',
    '/cart',
    '/api*',
    '/auth*',
  ],
  additionalPaths: async () => [
    { loc: '/', changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() },
    { loc: '/products', changefreq: 'hourly', priority: 0.9, lastmod: new Date().toISOString() },
    { loc: '/cam-nang', changefreq: 'weekly', priority: 0.7, lastmod: new Date().toISOString() },
    { loc: '/gioi-thieu', changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() },
    { loc: '/lien-he', changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() },
    { loc: '/flash-sale', changefreq: 'hourly', priority: 0.8, lastmod: new Date().toISOString() },
  ],
};

module.exports = config;
