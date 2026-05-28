import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CollectionName, collections, getCollection } from './collections';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface ResolvedRef {
  url: string;
  label: string;
  exists: boolean;
}

function readTitle(filepath: string, fallback: string): string {
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    const { data } = matter(raw);
    if (typeof data.title === 'string' && data.title.trim()) return data.title.trim();
    if (typeof data.name === 'string' && data.name.trim()) return data.name.trim();
  } catch {
    // fall through
  }
  return fallback;
}

// Library is no longer a single collection — `sources:` and friends reference
// a slug that may live in books, papers, publishers, or publications. This
// virtual lookup walks the sub-collections in order and returns the first hit.
const LIBRARY_SUB_COLLECTIONS = ['books', 'papers', 'publishers', 'publications'] as const;

function resolveLibraryRef(slug: string): ResolvedRef {
  for (const sub of LIBRARY_SUB_COLLECTIONS) {
    const cfg = getCollection(sub);
    if (!cfg) continue;
    const filepath = path.join(CONTENT_ROOT, cfg.folder, `${slug}.md`);
    if (fs.existsSync(filepath)) {
      return {
        url: `${cfg.urlPrefix}/${slug}`,
        label: readTitle(filepath, slug),
        exists: true,
      };
    }
  }
  // Not found anywhere — return a books URL as fallback (so links don't break)
  return { url: `/resources/library/books/${slug}`, label: slug, exists: false };
}

// Resolve a bare slug inside a known collection. URL is built from the
// collection's urlPrefix so it adapts to URL grouping changes automatically.
// The string 'library' is a virtual lookup across the bibliographic
// sub-collections (books, papers, publishers, publications).
export function resolveRef(collection: CollectionName | 'library', slug: string): ResolvedRef {
  if (collection === 'library') return resolveLibraryRef(slug);

  const cfg = getCollection(collection);
  if (!cfg) return { url: `/${collection}/${slug}`, label: slug, exists: false };

  let filepath: string | null = null;
  const url = `${cfg.urlPrefix}/${slug}`;

  switch (collection) {
    case 'blog': {
      const blogRoot = path.join(CONTENT_ROOT, cfg.folder);
      if (fs.existsSync(blogRoot)) {
        outer: for (const year of fs.readdirSync(blogRoot)) {
          const yearPath = path.join(blogRoot, year);
          if (!fs.statSync(yearPath).isDirectory()) continue;
          for (const month of fs.readdirSync(yearPath)) {
            const monthPath = path.join(yearPath, month);
            if (!fs.statSync(monthPath).isDirectory()) continue;
            const candidate = path.join(monthPath, `${slug}.md`);
            if (fs.existsSync(candidate)) {
              filepath = candidate;
              break outer;
            }
          }
        }
      }
      break;
    }
    case 'reports': {
      const reportFolder = path.join(CONTENT_ROOT, cfg.folder, slug);
      if (fs.existsSync(reportFolder)) {
        const versions = fs.readdirSync(reportFolder)
          .filter(v => v.startsWith('v') && fs.statSync(path.join(reportFolder, v)).isDirectory())
          .sort();
        if (versions.length) {
          filepath = path.join(reportFolder, versions[versions.length - 1], `${slug}.md`);
        }
      }
      break;
    }
    default:
      filepath = path.join(CONTENT_ROOT, cfg.folder, `${slug}.md`);
  }

  const exists = !!(filepath && fs.existsSync(filepath));
  const label = exists ? readTitle(filepath!, slug) : slug;
  return { url, label, exists };
}

// Resolve a qualified-path wikilink reference. The wikilink path mirrors
// the folder layout in the content repo — e.g.
// `[[research/insights/foo]]` → file at `content/research/insights/foo.md`,
// URL `/research/insights/foo`. Top-level collections (people, blog,
// tags, organizations) keep their single-segment prefix.
// Bare (no slash) refs default to the topic-aggregation page.
export function resolveQualifiedRef(qualified: string): ResolvedRef {
  if (!qualified.includes('/')) {
    return { url: `/topics/${qualified}`, label: qualified, exists: false };
  }

  // Find the collection by longest-matching folder path. Most collections
  // are 2-segment (research/insights, resources/wiki); top-level collections
  // are 1-segment (people, blog, tags).
  const cfg = findCollectionByQualified(qualified);
  if (!cfg) {
    return { url: `/${qualified}`, label: qualified.split('/').pop() || qualified, exists: false };
  }

  // Compute slug = everything after the collection's folder path.
  const remainder = qualified.slice(cfg.folder.length).replace(/^\//, '');
  return resolveRef(cfg.name, remainder);
}

function findCollectionByQualified(qualified: string) {
  const sorted = Object.values(collections)
    .filter(c => c.folder)
    .sort((a, b) => b.folder.length - a.folder.length);
  for (const cfg of sorted) {
    if (qualified === cfg.folder) return cfg;
    if (qualified.startsWith(cfg.folder + '/')) return cfg;
  }
  return null;
}
