import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CollectionName, getCollection } from './collections';

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

// Resolve a bare slug inside a known collection. URL is built from the
// collection's urlPrefix so it adapts to URL grouping changes automatically.
export function resolveRef(collection: CollectionName, slug: string): ResolvedRef {
  const cfg = getCollection(collection);
  if (!cfg) return { url: `/${collection}/${slug}`, label: slug, exists: false };

  let filepath: string | null = null;
  const url = `${cfg.urlPrefix}/${slug}`;

  switch (collection) {
    case 'library':
      filepath = path.join(CONTENT_ROOT, 'library', `${slug}.md`);
      break;
    case 'blog': {
      const blogRoot = path.join(CONTENT_ROOT, 'blog');
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
      const reportFolder = path.join(CONTENT_ROOT, 'reports', slug);
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

// Resolve a qualified-path wikilink reference like "wiki/network-coordination"
// or "library/olleros-antirival-goods". The first segment is the
// collection name (per the content-repo folder layout); the URL is built
// from that collection's urlPrefix.
// Bare (no slash) refs default to the topic-aggregation page.
export function resolveQualifiedRef(qualified: string): ResolvedRef {
  if (qualified.includes('/')) {
    const [collection, ...rest] = qualified.split('/');
    const slug = rest.join('/');
    const cfg = getCollection(collection);
    if (cfg) return resolveRef(collection as CollectionName, slug);
  }
  return { url: `/topics/${qualified}`, label: qualified, exists: false };
}
