// Registry of content collections recognised by the catch-all router.
// Each collection declares its folder in the content repo (or website repo
// for the cross-cutting templates), the URL pattern it appears under, the
// resolver that handles its URL → file mapping, and the layout that renders
// its items. Sub-collections additionally declare their parent.
//
// Plain-page singletons (manifesto, the root CONTRIBUTING.md) are NOT
// collections — they're handled by explicit URL routing in the resolver and
// rendered via the PlainPage layout.

export type CollectionName =
  // Top-level collections under URL groupings
  | 'wiki'
  | 'glossary'
  | 'essays'
  | 'observations'
  | 'insights'
  | 'hypotheses'
  | 'reports'
  // Per-entity library collections (siblings under /resources/library/)
  | 'books'
  | 'papers'
  | 'publishers'
  | 'publications'
  // Docs collections (siblings under /docs/) and their sub-collections
  | 'conventions'
  | 'conventions/naming'
  | 'conventions/frontmatter'
  | 'schemas'
  | 'contributing'
  // Top-level (no enclosing URL grouping)
  | 'blog'
  | 'people'
  | 'organizations'
  | 'tags'
  | 'topics'
  // Cross-cutting (website repo)
  | 'pages';

export type ResolverKind =
  | 'bare-slug'
  | 'blog-flattened'
  | 'reports-versioned'
  | 'pages-transparent';

export interface CollectionConfig {
  name: CollectionName;
  folder: string;            // Path under the content repo, or the website repo for `pages`
  urlPrefix: string;         // URL prefix on the site (without trailing slash); empty for pages
  resolver: ResolverKind;
  layout: string;            // Layout component name (dispatched in the catch-all)
  parent?: CollectionName;   // For sub-collections of a nested collection
}

export const collections: Record<CollectionName, CollectionConfig> = {
  // /thinking
  essays:       { name: 'essays',       folder: 'thinking/essays',       urlPrefix: '/thinking/essays',       resolver: 'bare-slug', layout: 'EssayDetail' },

  // /resources
  wiki:         { name: 'wiki',         folder: 'resources/wiki',        urlPrefix: '/resources/wiki',        resolver: 'bare-slug', layout: 'WikiArticle' },
  glossary:     { name: 'glossary',     folder: 'resources/glossary',    urlPrefix: '/resources/glossary',    resolver: 'bare-slug', layout: 'GlossaryTerm' },

  // /resources/library — per-entity sibling collections
  books:        { name: 'books',        folder: 'resources/library/books',        urlPrefix: '/resources/library/books',        resolver: 'bare-slug', layout: 'LibraryEntry' },
  papers:       { name: 'papers',       folder: 'resources/library/papers',       urlPrefix: '/resources/library/papers',       resolver: 'bare-slug', layout: 'LibraryEntry' },
  publishers:   { name: 'publishers',   folder: 'resources/library/publishers',   urlPrefix: '/resources/library/publishers',   resolver: 'bare-slug', layout: 'ArticleLayout' },
  publications: { name: 'publications', folder: 'resources/library/publications', urlPrefix: '/resources/library/publications', resolver: 'bare-slug', layout: 'ArticleLayout' },

  // /research
  observations: { name: 'observations', folder: 'research/observations', urlPrefix: '/research/observations', resolver: 'bare-slug', layout: 'ObservationDetail' },
  insights:     { name: 'insights',     folder: 'research/insights',     urlPrefix: '/research/insights',     resolver: 'bare-slug', layout: 'InsightDetail' },
  hypotheses:   { name: 'hypotheses',   folder: 'research/hypotheses',   urlPrefix: '/research/hypotheses',   resolver: 'bare-slug', layout: 'HypothesisDetail' },
  reports:      { name: 'reports',      folder: 'research/reports',      urlPrefix: '/research/reports',      resolver: 'reports-versioned', layout: 'ArticleLayout' },

  // /docs — top-level docs collections + nested sub-collections
  conventions:                 { name: 'conventions',                folder: 'docs/conventions',                urlPrefix: '/docs/conventions',                resolver: 'bare-slug', layout: 'ArticleLayout' },
  'conventions/naming':        { name: 'conventions/naming',         folder: 'docs/conventions/naming',         urlPrefix: '/docs/conventions/naming',         resolver: 'bare-slug', layout: 'ArticleLayout', parent: 'conventions' },
  'conventions/frontmatter':   { name: 'conventions/frontmatter',    folder: 'docs/conventions/frontmatter',    urlPrefix: '/docs/conventions/frontmatter',    resolver: 'bare-slug', layout: 'ArticleLayout', parent: 'conventions' },
  schemas:                     { name: 'schemas',                    folder: 'docs/schemas',                    urlPrefix: '/docs/schemas',                    resolver: 'bare-slug', layout: 'ArticleLayout' },
  contributing:                { name: 'contributing',               folder: 'docs/contributing',               urlPrefix: '/docs/contributing',               resolver: 'bare-slug', layout: 'ArticleLayout' },

  // Top-level (no enclosing URL grouping)
  blog:          { name: 'blog',          folder: 'blog',          urlPrefix: '/blog',          resolver: 'blog-flattened', layout: 'BlogPost' },
  people:        { name: 'people',        folder: 'people',        urlPrefix: '/people',        resolver: 'bare-slug',      layout: 'PersonProfile' },
  organizations: { name: 'organizations', folder: 'organizations', urlPrefix: '/organizations', resolver: 'bare-slug',      layout: 'ArticleLayout' },
  tags:          { name: 'tags',          folder: 'tags',          urlPrefix: '/tags',          resolver: 'bare-slug',      layout: 'ArticleLayout' },
  topics:        { name: 'topics',        folder: '',              urlPrefix: '/topics',        resolver: 'bare-slug',      layout: 'ArticleLayout' },

  // Composed pages — lives in the website repo, routed transparently.
  pages:         { name: 'pages',         folder: 'pages',         urlPrefix: '',               resolver: 'pages-transparent', layout: 'ComposedPage' },
};

export function getCollection(name: string): CollectionConfig | null {
  if (name in collections) {
    return collections[name as CollectionName];
  }
  return null;
}

// Reverse lookup: given a URL prefix, find the collection. Used by the
// resolver to map incoming URL segments to collection configs.
export function getCollectionByUrlPrefix(urlPrefix: string): CollectionConfig | null {
  for (const cfg of Object.values(collections)) {
    if (cfg.urlPrefix === urlPrefix) return cfg;
  }
  return null;
}
