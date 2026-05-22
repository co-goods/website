// Site-level configuration for the Co-Goods website.
//
// Drives which routes are reachable in production, which pages get indexed,
// and which features are toggled on. The `devMode` flag (sourced from
// NEXT_PUBLIC_DEV_MODE at build time) flips the public/private gating off so
// every route is reachable during development and on preview deploys.

const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Collection-level toggles. When false in production, the collection's URLs
// return 404 (catch-all sees the toggle and rejects). When `devMode` is true,
// every collection is reachable regardless of these toggles.
export const enabledCollections = {
  wiki: false,
  essays: false,
  insights: false,
  observations: false,
  hypotheses: false,
  library: false,
  glossary: false,
  blog: false,
  people: false,
  tags: false,
  reports: false,
  topics: false,
  docs: false,
  contributing: true,
};

// Page-level toggles for the hand-written / one-off pages.
export const enabledPages = {
  home: true,
  about: false,
  internal: true, // /_dev — always reachable; noindexed
};

// Pages that should appear in sitemap.xml and be indexable by search engines.
// Everything else is noindex,nofollow.
export const indexablePaths = new Set<string>([
  '/',
  // Add to this set only when a page is ready for public discovery.
]);

export function isCollectionEnabled(name: string): boolean {
  if (devMode) return true;
  return (enabledCollections as Record<string, boolean>)[name] === true;
}

export function isPageEnabled(name: string): boolean {
  if (devMode) return true;
  return (enabledPages as Record<string, boolean>)[name] === true;
}

export function isIndexable(path: string): boolean {
  return indexablePaths.has(path);
}

export const siteConfig = {
  devMode,
  enabledCollections,
  enabledPages,
  indexablePaths,
} as const;
