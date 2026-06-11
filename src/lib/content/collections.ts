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
  | 'standards'
  | 'articles'
  // Docs collections (siblings under /docs/)
  | 'conventions'
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
  | 'glossary-lettered'
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
  description?: string;      // One-line summary, shown on area-overview cards
}

export const collections: Record<CollectionName, CollectionConfig> = {
  // /thinking
  essays:       { name: 'essays',       folder: 'thinking/essays',       urlPrefix: '/thinking/essays',       resolver: 'bare-slug', layout: 'EssayDetail' },

  // /resources
  wiki:         { name: 'wiki',         folder: 'resources/wiki',        urlPrefix: '/resources/wiki',        resolver: 'bare-slug', layout: 'WikiArticle' },
  glossary:     { name: 'glossary',     folder: 'resources/glossary',    urlPrefix: '/resources/glossary',    resolver: 'glossary-lettered', layout: 'GlossaryTerm' },

  // /resources/library — per-entity sibling collections
  books:        { name: 'books',        folder: 'resources/library/books',        urlPrefix: '/resources/library/books',        resolver: 'bare-slug', layout: 'LibraryEntry' },
  papers:       { name: 'papers',       folder: 'resources/library/papers',       urlPrefix: '/resources/library/papers',       resolver: 'bare-slug', layout: 'LibraryEntry' },
  publishers:   { name: 'publishers',   folder: 'resources/library/publishers',   urlPrefix: '/resources/library/publishers',   resolver: 'bare-slug', layout: 'ArticleLayout' },
  publications: { name: 'publications', folder: 'resources/library/publications', urlPrefix: '/resources/library/publications', resolver: 'bare-slug', layout: 'ArticleLayout' },
  standards:    { name: 'standards',    folder: 'resources/library/standards',    urlPrefix: '/resources/library/standards',    resolver: 'bare-slug', layout: 'LibraryEntry' },
  articles:     { name: 'articles',     folder: 'resources/library/articles',     urlPrefix: '/resources/library/articles',     resolver: 'bare-slug', layout: 'LibraryEntry' },

  // /research
  observations: { name: 'observations', folder: 'research/observations', urlPrefix: '/research/observations', resolver: 'bare-slug', layout: 'ObservationDetail' },
  insights:     { name: 'insights',     folder: 'research/insights',     urlPrefix: '/research/insights',     resolver: 'bare-slug', layout: 'InsightDetail' },
  hypotheses:   { name: 'hypotheses',   folder: 'research/hypotheses',   urlPrefix: '/research/hypotheses',   resolver: 'bare-slug', layout: 'HypothesisDetail' },
  reports:      { name: 'reports',      folder: 'research/reports',      urlPrefix: '/research/reports',      resolver: 'reports-versioned', layout: 'ArticleLayout' },

  // /docs — top-level docs collections. (Nested sub-collections are supported
  // by the model + layout, but none exist yet; declare them here only once
  // real nested content lands, and avoid colliding a sub-collection URL with a
  // flat doc slug — e.g. a `conventions/frontmatter` sub-collection would
  // shadow the flat `frontmatter` doc.)
  conventions:                 { name: 'conventions',                folder: 'docs/conventions',                urlPrefix: '/docs/conventions',                resolver: 'bare-slug', layout: 'ArticleLayout', description: 'How content is organised — taxonomy, templates, frontmatter, naming, wikilinks, and licensing.' },
  schemas:                     { name: 'schemas',                    folder: 'docs/schemas',                    urlPrefix: '/docs/schemas',                    resolver: 'bare-slug', layout: 'ArticleLayout', description: 'The data shapes behind the content — frontmatter contracts per content type.' },
  contributing:                { name: 'contributing',               folder: 'docs/contributing',               urlPrefix: '/docs/contributing',               resolver: 'bare-slug', layout: 'ArticleLayout', description: 'Step-by-step guides for adding and editing content.' },

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
