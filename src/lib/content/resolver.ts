import fs from 'fs';
import path from 'path';
import { collections, getCollection, CollectionConfig, CollectionName } from './collections';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface ResolvedPage {
  kind: 'page';
  collection: CollectionConfig;
  filepath: string;
  // URL segments after the collection's URL prefix
  innerSegments: string[];
}

export interface ResolvedIndex {
  kind: 'index';
  collection: CollectionConfig;
  innerSegments: string[];
}

// Plain-page standalones (manifesto, root CONTRIBUTING.md). Rendered via the
// PlainPage layout. Not part of any collection.
export interface ResolvedStandalone {
  kind: 'standalone';
  filepath: string;
  url: string;
}

export type Resolved = ResolvedPage | ResolvedIndex | ResolvedStandalone;

// ---------- URL prefix matching ----------

// Match the start of `slug` against any collection's urlPrefix.
// Longest-prefix-first so /resources/library/books wins over /resources, and
// /docs/conventions/naming wins over /docs/conventions.
function matchUrlPrefix(slug: string[]): { collection: CollectionConfig; rest: string[] } | null {
  const fullPath = '/' + slug.join('/');

  const sorted = Object.values(collections).sort(
    (a, b) => b.urlPrefix.length - a.urlPrefix.length,
  );

  for (const cfg of sorted) {
    if (!cfg.urlPrefix) continue;
    if (fullPath === cfg.urlPrefix) {
      return { collection: cfg, rest: [] };
    }
    if (fullPath.startsWith(cfg.urlPrefix + '/')) {
      const remainder = fullPath.slice(cfg.urlPrefix.length + 1);
      return { collection: cfg, rest: remainder.split('/') };
    }
  }
  return null;
}

// ---------- Page resolvers ----------

function resolveBareSlugPage(cfg: CollectionConfig, rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const filepath = path.join(CONTENT_ROOT, cfg.folder, `${rest[0]}.md`);
  if (!fs.existsSync(filepath)) return null;
  return { kind: 'page', collection: cfg, filepath, innerSegments: rest };
}

function resolveBlogPage(rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const collection = getCollection('blog')!;
  const blogRoot = path.join(CONTENT_ROOT, collection.folder);
  if (!fs.existsSync(blogRoot)) return null;

  for (const year of fs.readdirSync(blogRoot)) {
    const yearPath = path.join(blogRoot, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;
    for (const month of fs.readdirSync(yearPath)) {
      const monthPath = path.join(yearPath, month);
      if (!fs.statSync(monthPath).isDirectory()) continue;
      const filepath = path.join(monthPath, `${rest[0]}.md`);
      if (fs.existsSync(filepath)) {
        return { kind: 'page', collection, filepath, innerSegments: rest };
      }
    }
  }
  return null;
}

function resolveReportsPage(rest: string[]): ResolvedPage | null {
  if (rest.length < 1) return null;
  const collection = getCollection('reports')!;
  const [slug, maybeVersion] = rest;

  const reportFolder = path.join(CONTENT_ROOT, collection.folder, slug);
  if (!fs.existsSync(reportFolder) || !fs.statSync(reportFolder).isDirectory()) {
    return null;
  }

  let version = maybeVersion;
  if (!version) {
    const versions = fs.readdirSync(reportFolder)
      .filter(v => v.startsWith('v') && fs.statSync(path.join(reportFolder, v)).isDirectory())
      .sort();
    if (!versions.length) return null;
    version = versions[versions.length - 1];
  }

  const filepath = path.join(reportFolder, version, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;

  return {
    kind: 'page',
    collection,
    filepath,
    innerSegments: maybeVersion ? rest : [slug, version],
  };
}

// Plain-page standalones: manifesto at /thinking/manifesto, root CONTRIBUTING.md
// at /contributing. Both rendered via the PlainPage layout.
function resolveStandalone(slug: string[]): ResolvedStandalone | null {
  if (slug.length === 1 && slug[0] === 'contributing') {
    const filepath = path.join(CONTENT_ROOT, 'CONTRIBUTING.md');
    if (!fs.existsSync(filepath)) return null;
    return { kind: 'standalone', filepath, url: '/contributing' };
  }
  if (slug.length === 2 && slug[0] === 'thinking' && slug[1] === 'manifesto') {
    const filepath = path.join(CONTENT_ROOT, 'thinking', 'manifesto.md');
    if (!fs.existsSync(filepath)) return null;
    return { kind: 'standalone', filepath, url: '/thinking/manifesto' };
  }
  return null;
}

// Composed pages live in the website repo (not the content submodule), under
// `pages/`. The URL path maps to the file path, at any depth
// (pages/community/events.md → /community/events). `home` is excluded —
// pages/home.md is served at / by app/page.tsx, not /home. Runs as a fallback
// after prefixed collections so /blog, /people, /tags, etc. keep priority;
// only unclaimed segments fall through to pages/.
const PAGES_ROOT = path.join(process.cwd(), 'pages');

function resolvePagesPage(slug: string[]): ResolvedPage | null {
  if (!slug.length) return null;
  if (slug.length === 1 && slug[0] === 'home') return null;
  // Reject dotfiles and any traversal so the URL can't escape pages/.
  if (slug.some(s => !s || s.startsWith('.') || s.includes('/') || s.includes('\\'))) {
    return null;
  }
  const collection = getCollection('pages')!;
  const filepath = path.join(PAGES_ROOT, ...slug) + '.md';
  if (!fs.existsSync(filepath)) return null;
  return { kind: 'page', collection, filepath, innerSegments: [] };
}

function resolvePage(slug: string[]): ResolvedPage | null {
  if (!slug.length) return null;

  const matched = matchUrlPrefix(slug);
  if (!matched) return null;
  const { collection, rest } = matched;

  if (rest.length === 0) return null; // index, not a page

  switch (collection.resolver) {
    case 'blog-flattened':
      return resolveBlogPage(rest);
    case 'reports-versioned':
      return resolveReportsPage(rest);
    case 'pages-transparent':
      return null;
    case 'bare-slug':
    default:
      return resolveBareSlugPage(collection, rest);
  }
}

// ---------- Index resolvers ----------

function resolveIndex(slug: string[]): ResolvedIndex | null {
  const matched = matchUrlPrefix(slug);
  if (!matched) return null;
  const { collection, rest } = matched;

  if (rest.length === 0) {
    const folderToCheck = collection.folder || '';
    const dir = folderToCheck ? path.join(CONTENT_ROOT, folderToCheck) : CONTENT_ROOT;
    if (folderToCheck && !fs.existsSync(dir)) return null;
    return { kind: 'index', collection, innerSegments: [] };
  }

  return null;
}

// ---------- Umbrella + derived resolvers ----------

export interface ResolvedUmbrella {
  kind: 'umbrella';
  name: 'thinking' | 'resources' | 'research' | 'docs' | 'library';
}

function resolveUmbrella(slug: string[]): ResolvedUmbrella | null {
  if (slug.length === 1) {
    if (slug[0] === 'thinking') return { kind: 'umbrella', name: 'thinking' };
    if (slug[0] === 'resources') return { kind: 'umbrella', name: 'resources' };
    if (slug[0] === 'research') return { kind: 'umbrella', name: 'research' };
    if (slug[0] === 'docs') return { kind: 'umbrella', name: 'docs' };
  }
  if (slug.length === 2 && slug[0] === 'resources' && slug[1] === 'library') {
    return { kind: 'umbrella', name: 'library' };
  }
  return null;
}

export interface ResolvedDerived {
  kind: 'derived';
  view: 'research-sources' | 'research-tags' | 'research-authors';
  slug?: string;
}

function resolveDerived(slug: string[]): ResolvedDerived | null {
  if (slug.length === 2 && slug[0] === 'research' && slug[1] === 'sources') {
    return { kind: 'derived', view: 'research-sources' };
  }
  if (slug.length === 2 && slug[0] === 'research' && slug[1] === 'tags') {
    return { kind: 'derived', view: 'research-tags' };
  }
  if (slug.length === 3 && slug[0] === 'research' && slug[1] === 'tags') {
    return { kind: 'derived', view: 'research-tags', slug: slug[2] };
  }
  if (slug.length === 2 && slug[0] === 'research' && slug[1] === 'authors') {
    return { kind: 'derived', view: 'research-authors' };
  }
  return null;
}

// ---------- Public entrypoint ----------

export type ResolveResult = Resolved | ResolvedUmbrella | ResolvedDerived;

export function resolveUrl(slug: string[]): ResolveResult | null {
  // Plain-page standalones first — explicit URL routing for manifesto and
  // root CONTRIBUTING.md, both rendered via the PlainPage layout.
  const standalone = resolveStandalone(slug);
  if (standalone) return standalone;

  const umbrella = resolveUmbrella(slug);
  if (umbrella) return umbrella;

  const derived = resolveDerived(slug);
  if (derived) return derived;

  const page = resolvePage(slug);
  if (page) return page;

  const index = resolveIndex(slug);
  if (index) return index;

  // Fallback: unclaimed single segments map to pages/<slug>.md (website repo).
  return resolvePagesPage(slug);
}

// Convenience: build a URL for a collection slug at the right prefix.
export function buildUrl(collection: CollectionName, slug: string): string {
  const cfg = collections[collection];
  return `${cfg.urlPrefix}/${slug}`;
}
