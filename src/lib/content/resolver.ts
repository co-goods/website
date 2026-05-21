import fs from 'fs';
import path from 'path';
import { getCollection, CollectionConfig } from './collections';

const RESEARCH_ROOT = path.join(process.cwd(), 'research');

export interface ResolvedPage {
  collection: CollectionConfig;
  filepath: string;
  // URL segments after the collection name (e.g. ['conventions','frontmatter']
  // for /docs/conventions/frontmatter)
  innerSegments: string[];
}

// Strip leading NN- ordering prefix from a folder or filename. Used by the
// docs collection (and potentially other ordered collections later).
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

function resolveDocs(rest: string[]): ResolvedPage | null {
  if (rest.length !== 2) return null;
  const [category, slug] = rest;

  const docsRoot = path.join(RESEARCH_ROOT, 'docs');
  const categoryDir = findEntryWithStrippedPrefix(docsRoot, category, true);
  if (!categoryDir) return null;
  const filepath = findEntryWithStrippedPrefix(categoryDir, slug, false);
  if (!filepath) return null;

  return {
    collection: getCollection('docs')!,
    filepath,
    innerSegments: [category, slug],
  };
}

function resolveBareSlug(collectionName: string, rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const collection = getCollection(collectionName);
  if (!collection) return null;

  const filepath = path.join(RESEARCH_ROOT, collection.folder, `${rest[0]}.md`);
  if (!fs.existsSync(filepath)) return null;

  return { collection, filepath, innerSegments: rest };
}

function resolveLibrary(rest: string[]): ResolvedPage | null {
  const collection = getCollection('library')!;
  if (rest.length === 1) {
    const filepath = path.join(RESEARCH_ROOT, 'library', `${rest[0]}.md`);
    if (!fs.existsSync(filepath)) return null;
    return { collection, filepath, innerSegments: rest };
  }
  if (rest.length === 2 && (rest[0] === 'publishers' || rest[0] === 'publications')) {
    const filepath = path.join(RESEARCH_ROOT, 'library', rest[0], `${rest[1]}.md`);
    if (!fs.existsSync(filepath)) return null;
    return { collection, filepath, innerSegments: rest };
  }
  return null;
}

function resolveBlog(rest: string[]): ResolvedPage | null {
  if (rest.length !== 1) return null;
  const collection = getCollection('blog')!;
  const blogRoot = path.join(RESEARCH_ROOT, 'blog');
  if (!fs.existsSync(blogRoot)) return null;

  // Walk year/month folders to find <slug>.md
  for (const year of fs.readdirSync(blogRoot)) {
    const yearPath = path.join(blogRoot, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;
    for (const month of fs.readdirSync(yearPath)) {
      const monthPath = path.join(yearPath, month);
      if (!fs.statSync(monthPath).isDirectory()) continue;
      const filepath = path.join(monthPath, `${rest[0]}.md`);
      if (fs.existsSync(filepath)) {
        return { collection, filepath, innerSegments: rest };
      }
    }
  }
  return null;
}

function resolveReports(rest: string[]): ResolvedPage | null {
  if (rest.length < 1) return null;
  const collection = getCollection('reports')!;
  const [slug, maybeVersion] = rest;

  const reportFolder = path.join(RESEARCH_ROOT, 'reports', slug);
  if (!fs.existsSync(reportFolder) || !fs.statSync(reportFolder).isDirectory()) {
    return null;
  }

  let version = maybeVersion;
  if (!version) {
    // Pick latest version: highest-sorted directory entry starting with 'v'
    const versions = fs.readdirSync(reportFolder)
      .filter(v => v.startsWith('v') && fs.statSync(path.join(reportFolder, v)).isDirectory())
      .sort();
    if (!versions.length) return null;
    version = versions[versions.length - 1];
  }

  const filepath = path.join(reportFolder, version, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;

  return {
    collection,
    filepath,
    innerSegments: maybeVersion ? rest : [slug, version],
  };
}

function resolveContributing(): ResolvedPage | null {
  const filepath = path.join(RESEARCH_ROOT, 'CONTRIBUTING.md');
  if (!fs.existsSync(filepath)) return null;
  return {
    collection: getCollection('contributing')!,
    filepath,
    innerSegments: [],
  };
}

export function resolveUrl(slug: string[]): ResolvedPage | null {
  if (!slug.length) return null;
  const [first, ...rest] = slug;

  if (first === 'contributing' && rest.length === 0) return resolveContributing();
  if (first === 'docs') return resolveDocs(rest);
  if (first === 'library') return resolveLibrary(rest);
  if (first === 'blog') return resolveBlog(rest);
  if (first === 'reports') return resolveReports(rest);

  const bareCollections = [
    'wiki', 'essays', 'insights', 'observations', 'hypotheses',
    'glossary', 'people', 'tags', 'topics',
  ];
  if (bareCollections.includes(first)) {
    return resolveBareSlug(first, rest);
  }

  return null;
}
