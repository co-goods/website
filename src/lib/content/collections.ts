// Registry of content collections recognised by the catch-all router.
// Each collection declares which layout to use, which resolver handles
// its URL → file mapping, and the URL prefix that surfaces it to readers.
//
// The URL prefix is independent of the folder name in the content repo —
// folders stay flat (wiki/, essays/, etc.); the prefix is applied by the
// routing layer. This lets URL grouping evolve without renaming files.

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
  folder: string;           // Folder in the content repo (flat slug)
  urlPrefix: string;        // URL prefix applied by the router (without trailing slash)
  resolver: ResolverKind;
  layout: string;
}

export const collections: Record<CollectionName, CollectionConfig> = {
  docs:         { name: 'docs',         folder: 'docs',         urlPrefix: '/docs',                  resolver: 'docs-prefixed',    layout: 'DocLayout' },
  wiki:         { name: 'wiki',         folder: 'wiki',         urlPrefix: '/resources/wiki',        resolver: 'bare-slug',        layout: 'WikiArticle' },
  glossary:     { name: 'glossary',     folder: 'glossary',     urlPrefix: '/resources/glossary',    resolver: 'bare-slug',        layout: 'GlossaryTerm' },
  library:      { name: 'library',      folder: 'library',      urlPrefix: '/library',               resolver: 'library-nested',   layout: 'LibraryEntry' },
  essays:       { name: 'essays',       folder: 'essays',       urlPrefix: '/thinking/essays',       resolver: 'bare-slug',        layout: 'EssayDetail' },
  insights:     { name: 'insights',     folder: 'insights',     urlPrefix: '/research/insights',     resolver: 'bare-slug',        layout: 'InsightDetail' },
  observations: { name: 'observations', folder: 'observations', urlPrefix: '/research/observations', resolver: 'bare-slug',        layout: 'ObservationDetail' },
  hypotheses:   { name: 'hypotheses',   folder: 'hypotheses',   urlPrefix: '/research/hypotheses',   resolver: 'bare-slug',        layout: 'HypothesisDetail' },
  reports:      { name: 'reports',      folder: 'reports',      urlPrefix: '/research/reports',      resolver: 'reports-versioned', layout: 'ArticleLayout' },
  blog:         { name: 'blog',         folder: 'blog',         urlPrefix: '/blog',                  resolver: 'blog-flattened',   layout: 'BlogPost' },
  people:       { name: 'people',       folder: 'people',       urlPrefix: '/people',                resolver: 'bare-slug',        layout: 'PersonProfile' },
  organizations:{ name: 'organizations',folder: 'organizations',urlPrefix: '/organizations',         resolver: 'bare-slug',        layout: 'ArticleLayout' },
  tags:         { name: 'tags',         folder: 'tags',         urlPrefix: '/tags',                  resolver: 'bare-slug',        layout: 'ArticleLayout' },
  topics:       { name: 'topics',       folder: '',             urlPrefix: '/topics',                resolver: 'bare-slug',        layout: 'ArticleLayout' },
  contributing: { name: 'contributing', folder: '',             urlPrefix: '/contributing',          resolver: 'single-file',      layout: 'ArticleLayout' },
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
