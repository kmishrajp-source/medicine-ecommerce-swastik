import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://medicine-ecommerce-swastik-main.vercel.app';
  const locales = ['en', 'hi'];
  const routes = ['', '/shop', '/doctors', '/join', '/about', '/contact'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
