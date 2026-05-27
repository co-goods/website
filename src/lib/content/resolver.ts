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

export type Resolved = ResolvedPage | ResolvedIndex;

// Strip leading NN- ordering prefix from a folder or filename.
export function stripOrderPrefix(name: string): string {
  const m = name.match(/^\d+-(.+)$/);
  return m ? m[1] : name;
}

function findEntryWithStrippedPrefix(
  dir: string,
  bareName: string,
  isDir: boolean,
): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (isDir && !stat.isDirectory()) continue;
    if (!isDir && !stat.isFile()) continue;

    if (isDir) {
      if (stripOrderPrefix(entry) === bareName) return fullPath;
    } else {
      if (!entry.endsWith('.md')) continue;
      const slug = stripOrderPrefix(entry.replace(/\.md$/, ''));
      if (slug === bareName) return fullPath;
    }
  }
  return null;
}

// ---------- URL prefix matching ----------

// Match the start of `slug` against any collection's urlPrefix.
// Longest-prefix-first so /research/insights wins over /research.
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

function resolveDocsPage(rest: string[]): ResolvedPage | null {
  if (rest.length !== 2) return null;
  const [category, slug] = rest;

  const docsRoot = path.join(CONTENT_ROOT, 'docs');
  const categoryDir = findEntryWithStrippedPrefix(docsRoot, category, true);
  if (!categoryDir) return null;
  const filepath = findEntryWithStrippedPrefix(categoryDir, slug, false);
  if (!filepath) return null;

  return {
    kind: 'page',
    collection: getCollection('docs')!,
    filepath,
    innerSegments: [category, slug],
  };
}

function resolveBareSlugPage(cfg: CollectionConfig, rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const filepath = path.join(CONTENT_ROOT, cfg.folder, `${rest[0]}.md`);
  if (!fs.existsSync(filepath)) return null;
  return { kind: 'page', collection: cfg, filepath, innerSegments: rest };
}

function resolveLibraryPage(rest: string[]): ResolvedPage | null {
  const collection = getCollection('library')!;
  if (rest.length === 1) {
    const filepath = path.join(CONTENT_ROOT, collection.folder, `${rest[0]}.md`);
    if (!fs.existsSync(filepath)) return null;
    return { kind: 'page', collection, filepath, innerSegments: rest };
  }
  if (rest.length === 2 && (rest[0] === 'publishers' || rest[0] === 'publications')) {
    const filepath = path.join(CONTENT_ROOT, collection.folder, rest[0], `${rest[1]}.md`);
    if (!fs.existsSync(filepath)) return null;
    return { kind: 'page', collection, filepath, innerSegments: rest };
  }
  return null;
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

function resolveContributingPage(): ResolvedPage | null {
  const filepath = path.join(CONTENT_ROOT, 'CONTRIBUTING.md');
  if (!fs.existsSync(filepath)) return null;
  return {
    kind: 'page',
    collection: getCollection('contributing')!,
    filepath,
    innerSegments: [],
  };
}

function resolveSingleFilePage(
  collectionName: 'manifesto',
  relativePath: string,
): ResolvedPage | null {
  const filepath = path.join(CONTENT_ROOT, relativePath);
  if (!fs.existsSync(filepath)) return null;
  return {
    kind: 'page',
    collection: getCollection(collectionName)!,
    filepath,
    innerSegments: [],
  };
}

// Routing-transparent pages: a single-segment URL maps to content/pages/<slug>.md.
// `home` is excluded — pages/home.md is served at / by app/page.tsx, not /home.
// Runs as a fallback after prefixed collections so /blog, /people, /tags, etc.
// keep priority; only unclaimed single segments fall through to pages/.
function resolvePagesPage(slug: string[]): ResolvedPage | null {
  if (slug.length !== 1 || slug[0] === 'home') return null;
  const collection = getCollection('pages')!;
  const filepath = path.join(CONTENT_ROOT, collection.folder, `${slug[0]}.md`);
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
    case 'docs-prefixed':
      return resolveDocsPage(rest);
    case 'library-nested':
      return resolveLibraryPage(rest);
    case 'blog-flattened':
      return resolveBlogPage(rest);
    case 'reports-versioned':
      return resolveReportsPage(rest);
    case 'single-file':
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

  if (collection.resolver === 'single-file' && rest.length === 0) {
    return null;
  }

  if (rest.length === 0) {
    const folderToCheck = collection.folder || '';
    const dir = folderToCheck ? path.join(CONTENT_ROOT, folderToCheck) : CONTENT_ROOT;
    if (folderToCheck && !fs.existsSync(dir)) return null;
    return { kind: 'index', collection, innerSegments: [] };
  }

  // /docs/<category> intermediate index
  if (collection.name === 'docs' && rest.length === 1) {
    const docsRoot = path.join(CONTENT_ROOT, 'docs');
    const dir = findEntryWithStrippedPrefix(docsRoot, rest[0], true);
    if (dir) {
      return { kind: 'index', collection, innerSegments: rest };
    }
  }

  // /library/publishers, /library/publications
  if (
    collection.name === 'library' &&
    rest.length === 1 &&
    (rest[0] === 'publishers' || rest[0] === 'publications')
  ) {
    const subDir = path.join(CONTENT_ROOT, 'library', rest[0]);
    if (fs.existsSync(subDir) && fs.statSync(subDir).isDirectory()) {
      return { kind: 'index', collection, innerSegments: rest };
    }
  }

  return null;
}

// ---------- Umbrella + derived resolvers ----------

export interface ResolvedUmbrella {
  kind: 'umbrella';
  name: 'thinking' | 'resources' | 'research';
}

function resolveUmbrella(slug: string[]): ResolvedUmbrella | null {
  if (slug.length !== 1) return null;
  if (slug[0] === 'thinking') return { kind: 'umbrella', name: 'thinking' };
  if (slug[0] === 'resources') return { kind: 'umbrella', name: 'resources' };
  if (slug[0] === 'research') return { kind: 'umbrella', name: 'research' };
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
  const umbrella = resolveUmbrella(slug);
  if (umbrella) return umbrella;

  const derived = resolveDerived(slug);
  if (derived) return derived;

  if (slug.length === 1 && slug[0] === 'contributing') {
    const page = resolveContributingPage();
    if (page) return page;
  }
  if (slug.length === 2 && slug[0] === 'thinking' && slug[1] === 'manifesto') {
    const page = resolveSingleFilePage('manifesto', 'thinking/manifesto.md');
    if (page) return page;
  }

  const page = resolvePage(slug);
  if (page) return page;

  const index = resolveIndex(slug);
  if (index) return index;

  // Fallback: unclaimed single segments map to content/pages/<slug>.md.
  return resolvePagesPage(slug);
}

// Convenience: build a URL for a collection slug at the right prefix.
export function buildUrl(collection: CollectionName, slug: string): string {
  const cfg = collections[collection];
  return `${cfg.urlPrefix}/${slug}`;
}
