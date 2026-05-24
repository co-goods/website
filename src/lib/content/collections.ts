// Registry of content collections recognised by the catch-all router.
// Each collection declares which layout to use, which resolver handles
// its URL → file mapping, and the URL prefix that surfaces it to readers.
//
// Folder structure in the content repo mirrors the URL groupings: collections
// under /research/, /resources/, /thinking/ live in matching subfolders;
// cross-cutting collections (blog, people, organizations, tags, docs) stay
// at the content root.

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
  | 'organizations'
  | 'tags'
  | 'topics'
  | 'contributing'
  | 'manifesto'
  | 'about';

export type ResolverKind =
  | 'bare-slug'
  | 'docs-prefixed'
  | 'library-nested'
  | 'blog-flattened'
  | 'reports-versioned'
  | 'single-file';

export interface CollectionConfig {
  name: CollectionName;
  folder: string;           // Folder in the content repo (flat slug)
  urlPrefix: string;        // URL prefix applied by the router (without trailing slash)
  resolver: ResolverKind;
  layout: string;
}

export const collections: Record<CollectionName, CollectionConfig> = {
  docs:         { name: 'docs',         folder: 'docs',                  urlPrefix: '/docs',                  resolver: 'docs-prefixed',    layout: 'DocLayout' },
  wiki:         { name: 'wiki',         folder: 'resources/wiki',        urlPrefix: '/resources/wiki',        resolver: 'bare-slug',        layout: 'WikiArticle' },
  glossary:     { name: 'glossary',     folder: 'resources/glossary',    urlPrefix: '/resources/glossary',    resolver: 'bare-slug',        layout: 'GlossaryTerm' },
  library:      { name: 'library',      folder: 'resources/library',     urlPrefix: '/resources/library',     resolver: 'library-nested',   layout: 'LibraryEntry' },
  essays:       { name: 'essays',       folder: 'thinking/essays',       urlPrefix: '/thinking/essays',       resolver: 'bare-slug',        layout: 'EssayDetail' },
  insights:     { name: 'insights',     folder: 'research/insights',     urlPrefix: '/research/insights',     resolver: 'bare-slug',        layout: 'InsightDetail' },
  observations: { name: 'observations', folder: 'research/observations', urlPrefix: '/research/observations', resolver: 'bare-slug',        layout: 'ObservationDetail' },
  hypotheses:   { name: 'hypotheses',   folder: 'research/hypotheses',   urlPrefix: '/research/hypotheses',   resolver: 'bare-slug',        layout: 'HypothesisDetail' },
  reports:      { name: 'reports',      folder: 'research/reports',      urlPrefix: '/research/reports',      resolver: 'reports-versioned', layout: 'ArticleLayout' },
  blog:         { name: 'blog',         folder: 'blog',                  urlPrefix: '/blog',                  resolver: 'blog-flattened',   layout: 'BlogPost' },
  people:       { name: 'people',       folder: 'people',                urlPrefix: '/people',                resolver: 'bare-slug',        layout: 'PersonProfile' },
  organizations:{ name: 'organizations',folder: 'organizations',         urlPrefix: '/organizations',         resolver: 'bare-slug',        layout: 'ArticleLayout' },
  tags:         { name: 'tags',         folder: 'tags',                  urlPrefix: '/tags',                  resolver: 'bare-slug',        layout: 'ArticleLayout' },
  topics:       { name: 'topics',       folder: '',                      urlPrefix: '/topics',                resolver: 'bare-slug',        layout: 'ArticleLayout' },
  contributing: { name: 'contributing', folder: '',                      urlPrefix: '/contributing',          resolver: 'single-file',      layout: 'ArticleLayout' },
  manifesto:    { name: 'manifesto',    folder: '',                      urlPrefix: '/thinking/manifesto',    resolver: 'single-file',      layout: 'ArticleLayout' },
  about:        { name: 'about',        folder: '',                      urlPrefix: '/about',                 resolver: 'single-file',      layout: 'ArticleLayout' },
};

export function getCollection(name: string): CollectionConfig | null {
  if (name in collections) {
    return collections[name as CollectionName];
  }
  return null;
}

// Reverse lookup: given a URL prefix's first segment, find the collection.
// Used by the resolver to map incoming URL segments to collection configs.
export function getCollectionByUrlPrefix(urlPrefix: string): CollectionConfig | null {
  for (const cfg of Object.values(collections)) {
    if (cfg.urlPrefix === urlPrefix) return cfg;
  }
  return null;
}
