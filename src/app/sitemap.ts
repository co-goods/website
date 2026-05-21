import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cogoods.org'

  const collectionEntries: MetadataRoute.Sitemap = [
    { path: '/wiki', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/essays', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/insights', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/observations', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/hypotheses', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/library', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/glossary', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/people', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/tags', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/reports', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/docs', priority: 0.7, changeFrequency: 'monthly' },
  ].map(e => ({
    url: `${baseUrl}${e.path}`,
    lastModified: new Date(),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contributing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...collectionEntries,
  ]
}
