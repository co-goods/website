// Site-level configuration for the Co-Goods website.
//
// Drives which routes are reachable in production, which pages get indexed,
// and which features are toggled on. The `devMode` flag (sourced from
// NEXT_PUBLIC_DEV_MODE at build time) flips the public/private gating off so
// every route is reachable during development and on preview deploys.

// Dev-mode triggers route-gate bypass: every collection / page is reachable.
// Defaults ON during `next dev` (NODE_ENV !== 'production') so /wiki, /insights,
// /research/* etc. just work locally. In production builds (Vercel), the
// explicit env var NEXT_PUBLIC_DEV_MODE=true keeps the bypass on if set;
// otherwise the explicit toggles below decide what's reachable.
const devMode =
  process.env.NEXT_PUBLIC_DEV_MODE === 'true' ||
  process.env.NODE_ENV !== 'production';

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
  organizations: false,
  tags: false,
  reports: false,
  topics: false,
  docs: false,
  contributing: true,
  manifesto: true,
  about: true,
  // Umbrella landings — reachable when devMode or when any child is enabled.
  thinking: false,
  resources: false,
  research: false,
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
  '/thinking/manifesto',
  '/about',
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
