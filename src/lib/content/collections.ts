// Registry of content collections recognised by the catch-all router.
// Each collection declares which layout to use and which resolver handles
// its URL → file mapping.

export type CollectionName =
  | 'docs'
  | 'wiki'
  | 'essays'
  | 'reports'
  | 'insights'
  | 'observations'
  | 'hypotheses'
  | 'library'
  | 'glossary'
  | 'blog'
  | 'people'
  | 'tags'
  | 'topics'
  | 'contributing';

export type ResolverKind =
  | 'bare-slug'
  | 'docs-prefixed'
  | 'library-nested'
  | 'blog-flattened'
  | 'reports-versioned'
  | 'single-file';

export interface CollectionConfig {
  name: CollectionName;
  folder: string;
  resolver: ResolverKind;
  layout: string;
}

export const collections: Record<CollectionName, CollectionConfig> = {
  docs: { name: 'docs', folder: 'docs', resolver: 'docs-prefixed', layout: 'DocLayout' },
  wiki: { name: 'wiki', folder: 'wiki', resolver: 'bare-slug', layout: 'ArticleLayout' },
  essays: { name: 'essays', folder: 'essays', resolver: 'bare-slug', layout: 'ArticleLayout' },
  reports: { name: 'reports', folder: 'reports', resolver: 'reports-versioned', layout: 'ArticleLayout' },
  insights: { name: 'insights', folder: 'insights', resolver: 'bare-slug', layout: 'ArticleLayout' },
  observations: { name: 'observations', folder: 'observations', resolver: 'bare-slug', layout: 'ArticleLayout' },
  hypotheses: { name: 'hypotheses', folder: 'hypotheses', resolver: 'bare-slug', layout: 'ArticleLayout' },
  library: { name: 'library', folder: 'library', resolver: 'library-nested', layout: 'ArticleLayout' },
  glossary: { name: 'glossary', folder: 'glossary', resolver: 'bare-slug', layout: 'ArticleLayout' },
  blog: { name: 'blog', folder: 'blog', resolver: 'blog-flattened', layout: 'ArticleLayout' },
  people: { name: 'people', folder: 'people', resolver: 'bare-slug', layout: 'ArticleLayout' },
  tags: { name: 'tags', folder: 'tags', resolver: 'bare-slug', layout: 'ArticleLayout' },
  topics: { name: 'topics', folder: '', resolver: 'bare-slug', layout: 'ArticleLayout' },
  contributing: { name: 'contributing', folder: '', resolver: 'single-file', layout: 'ArticleLayout' },
};

export function getCollection(name: string): CollectionConfig | null {
  if (name in collections) {
    return collections[name as CollectionName];
  }
  return null;
}
