import { MetadataRoute } from 'next';
import { indexablePaths } from '@/site.config';

// Soft-launch indexing controls. Per-page `noindex,nofollow` meta tags (set by
// the catch-all's `generateMetadata`) are the primary control — they're
// honored even when robots.txt is permissive, and prevent pages from being
// indexed even if external links point to them.
//
// robots.txt here is a complementary signal. We use the `$` end-of-URL anchor
// (a Google/Bing extension supported by most modern crawlers) to allow the
// exact paths in `indexablePaths` and disallow everything else.

export default function robots(): MetadataRoute.Robots {
  const allow = Array.from(indexablePaths).map(p => `${p}$`);

  return {
    rules: [
      {
        userAgent: '*',
        allow,
        disallow: '/',
      },
    ],
    sitemap: 'https://cogoods.org/sitemap.xml',
  };
}
