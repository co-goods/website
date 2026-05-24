import { MetadataRoute } from 'next';
import { indexablePaths } from '@/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cogoods.org';

  return Array.from(indexablePaths).map(path => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
