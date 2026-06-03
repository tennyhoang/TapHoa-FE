import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? 'vi',
  messages: (await import(`../messages/${locale ?? 'vi'}.json`)).default,
}));
