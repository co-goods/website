import fs from 'fs';
import path from 'path';
import { getCollection, CollectionConfig } from './collections';

const RESEARCH_ROOT = path.join(process.cwd(), 'research');

export interface ResolvedPage {
  kind: 'page';
  collection: CollectionConfig;
  filepath: string;
  // URL segments after the collection name (e.g. ['conventions','frontmatter']
  // for /docs/conventions/frontmatter)
  innerSegments: string[];
}

export interface ResolvedIndex {
  kind: 'index';
  collection: CollectionConfig;
  // URL segments after the collection name (empty for /docs, [<cat>] for
  // /docs/<cat>, ['publishers'] for /library/publishers, etc.)
  innerSegments: string[];
}

export type Resolved = ResolvedPage | ResolvedIndex;

// Strip leading NN- ordering prefix from a folder or filename. Used by the
// docs collection.
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

// ---------- Page resolvers ----------

function resolveDocsPage(rest: string[]): ResolvedPage | null {
  if (rest.length !== 2) return null;
  const [category, slug] = rest;

  const docsRoot = path.join(RESEARCH_ROOT, 'docs');
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

function resolveBareSlugPage(collectionName: string, rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const collection = getCollection(collectionName);
  if (!collection) return null;

  const filepath = path.join(RESEARCH_ROOT, collection.folder, `${rest[0]}.md`);
  if (!fs.existsSync(filepath)) return null;

  return { kind: 'page', collection, filepath, innerSegments: rest };
}

function resolveLibraryPage(rest: string[]): ResolvedPage | null {
  const collection = getCollection('library')!;
  if (rest.length === 1) {
    const filepath = path.join(RESEARCH_ROOT, 'library', `${rest[0]}.md`);
    if (!fs.existsSync(filepath)) return null;
    return { kind: 'page', collection, filepath, innerSegments: rest };
  }
  if (rest.length === 2 && (rest[0] === 'publishers' || rest[0] === 'publications')) {
    const filepath = path.join(RESEARCH_ROOT, 'library', rest[0], `${rest[1]}.md`);
    if (!fs.existsSync(filepath)) return null;
    return { kind: 'page', collection, filepath, innerSegments: rest };
  }
  return null;
}

function resolveBlogPage(rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const collection = getCollection('blog')!;
  const blogRoot = path.join(RESEARCH_ROOT, 'blog');
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

  const reportFolder = path.join(RESEARCH_ROOT, 'reports', slug);
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
  const filepath = path.join(RESEARCH_ROOT, 'CONTRIBUTING.md');
  if (!fs.existsSync(filepath)) return null;
  return {
    kind: 'page',
    collection: getCollection('contributing')!,
    filepath,
    innerSegments: [],
  };
}

function resolvePage(slug: string[]): ResolvedPage | null {
  if (!slug.length) return null;
  const [first, ...rest] = slug;

  if (first === 'contributing' && rest.length === 0) return resolveContributingPage();
  if (first === 'docs') return resolveDocsPage(rest);
  if (first === 'library') return resolveLibraryPage(rest);
  if (first === 'blog') return resolveBlogPage(rest);
  if (first === 'reports') return resolveReportsPage(rest);

  const bareCollections = [
    'wiki', 'essays', 'insights', 'observations', 'hypotheses',
    'glossary', 'people', 'tags', 'topics',
  ];
  if (bareCollections.includes(first)) {
    return resolveBareSlugPage(first, rest);
  }

  return null;
}

// ---------- Index resolvers ----------

function resolveIndex(slug: string[]): ResolvedIndex | null {
  if (slug.length === 1) {
    const name = slug[0];
    const collection = getCollection(name);
    if (!collection) return null;

    // Index exists if the folder exists on disk
    const folderToCheck = collection.folder || '';
    const dir = folderToCheck ? path.join(RESEARCH_ROOT, folderToCheck) : RESEARCH_ROOT;
    if (folderToCheck && !fs.existsSync(dir)) return null;
    return { kind: 'index', collection, innerSegments: [] };
  }

  // /docs/<category>
  if (slug.length === 2 && slug[0] === 'docs') {
    const docsRoot = path.join(RESEARCH_ROOT, 'docs');
    const dir = findEntryWithStrippedPrefix(docsRoot, slug[1], true);
    if (dir) {
      return { kind: 'index', collection: getCollection('docs')!, innerSegments: [slug[1]] };
    }
  }

  // /library/publishers, /library/publications
  if (
    slug.length === 2 &&
    slug[0] === 'library' &&
    (slug[1] === 'publishers' || slug[1] === 'publications')
  ) {
    const subDir = path.join(RESEARCH_ROOT, 'library', slug[1]);
    if (fs.existsSync(subDir) && fs.statSync(subDir).isDirectory()) {
      return { kind: 'index', collection: getCollection('library')!, innerSegments: [slug[1]] };
    }
  }

  return null;
}

// ---------- Public entrypoint ----------

export function resolveUrl(slug: string[]): Resolved | null {
  const page = resolvePage(slug);
  if (page) return page;
  return resolveIndex(slug);
}
