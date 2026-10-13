import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl;
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/staff', '/account'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
