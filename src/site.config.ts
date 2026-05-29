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
  // Top-level collections
  wiki: false,
  essays: false,
  insights: false,
  observations: false,
  hypotheses: false,
  glossary: false,
  blog: false,
  people: false,
  organizations: false,
  tags: false,
  reports: false,
  topics: false,
  pages: true,
  // Per-entity library collections (under /resources/library/)
  books: false,
  papers: false,
  publishers: false,
  publications: false,
  // Docs collections (under /docs/) and their sub-collections
  conventions: false,
  'conventions/naming': false,
  'conventions/frontmatter': false,
  schemas: false,
  contributing: false,
  // URL groupings — reachable when devMode or when any child is enabled.
  thinking: false,
  resources: false,
  research: false,
  docs: false,
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

// External links, grouped by platform. Env-backed so values (e.g. a rotating
// Discord invite) change per environment without code edits; the defaults keep
// local + unset builds working. Convention: NEXT_PUBLIC_<PLATFORM>_<PURPOSE>.
// These are inlined at build (client-readable) — public URLs only, no secrets.
export const links = {
  discord: {
    invite:    process.env.NEXT_PUBLIC_DISCORD_INVITE    ?? 'https://discord.gg/2V8DuCeBWz',
    research:  process.env.NEXT_PUBLIC_DISCORD_RESEARCH   ?? 'https://discord.gg/8asdWDW5QY',
    calls:     process.env.NEXT_PUBLIC_DISCORD_CALLS      ?? 'https://discord.gg/Zes4pNuCPb',
    thinking:  process.env.NEXT_PUBLIC_DISCORD_THINKING   ?? 'https://discord.gg/eRHtnj7nhw',
    resources: process.env.NEXT_PUBLIC_DISCORD_RESOURCES  ?? 'https://discord.gg/h5Fh3Pzq26',
  } as Record<string, string>,
  github: {
    org: process.env.NEXT_PUBLIC_GITHUB_ORG ?? 'https://github.com/co-goods',
  } as Record<string, string>,
};

// Resolve a Discord reference to a URL. A full URL is used as-is; a bare key
// (e.g. "invite", "research") maps to links.discord[key]; anything missing or
// unknown falls back to the general invite, so there's always a link.
export function resolveDiscord(value?: string): string {
  if (value && /^https?:\/\//.test(value)) return value;
  if (value && links.discord[value]) return links.discord[value];
  return links.discord.invite;
}

// Per-area Discord fallback: a page's URL area (first path segment) picks a
// channel when the item declares no discord: of its own. Areas outside this
// map (docs, blog, people, …) fall through to the general invite.
const DISCORD_BY_AREA: Record<string, string> = {
  thinking: 'thinking',
  resources: 'resources',
  research: 'research',
};

export function discordKeyForArea(area?: string): string | undefined {
  return area ? DISCORD_BY_AREA[area] : undefined;
}

export const siteConfig = {
  devMode,
  enabledCollections,
  enabledPages,
  indexablePaths,
  links,
} as const;
