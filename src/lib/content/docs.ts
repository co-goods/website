import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { collections, CollectionConfig } from './collections';

// Docs navigation tree, derived from the collection registry (not the folder
// layout). The docs area is every collection whose URL sits under /docs:
// top-level groups (conventions, schemas, contributing) plus any sub-collections
// they declare via `parent`. Items sort by their frontmatter `order:`.

import { CONTENT_ROOT } from './paths';
const DOCS_PREFIX = '/docs';

export interface DocItem {
  url: string;
  filepath: string;
  title: string;
  description?: string;
  order: number;
}

export interface DocGroup {
  name: string;        // collection name, e.g. "conventions" or "conventions/naming"
  title: string;       // display title, e.g. "Conventions", "Naming"
  url: string;         // the group's index URL
  description?: string; // one-line summary from the registry
  items: DocItem[];
  subgroups: DocGroup[];
}

export interface DocsTree {
  groups: DocGroup[];
  flatList: DocItem[]; // depth-first display order, for prev/next traversal
}

function titleCase(leaf: string): string {
  return leaf
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function readMeta(filepath: string): { title: string; description?: string; order: number } {
  const { data, content } = matter(fs.readFileSync(filepath, 'utf8'));
  const title =
    (typeof data.title === 'string' && data.title.trim()) ||
    content.split('\n').find(l => l.startsWith('# '))?.replace(/^#\s+/, '').trim() ||
    path.basename(filepath, '.md');
  const description =
    typeof data.description === 'string' && data.description.trim()
      ? data.description.trim()
      : undefined;
  const order = typeof data.order === 'number' ? data.order : 9999;
  return { title, description, order };
}

function readItems(cfg: CollectionConfig): DocItem[] {
  const dir = path.join(CONTENT_ROOT, cfg.folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('template-') && !f.startsWith('_') && f !== 'INDEX.md')
    .map(f => {
      const filepath = path.join(dir, f);
      const slug = f.replace(/\.md$/, '');
      const { title, description, order } = readMeta(filepath);
      return { url: `${cfg.urlPrefix}/${slug}`, filepath, title, description, order };
    })
    .sort((a, b) => a.order - b.order);
}

function isDocsCollection(cfg: CollectionConfig): boolean {
  return cfg.urlPrefix === DOCS_PREFIX || cfg.urlPrefix.startsWith(DOCS_PREFIX + '/');
}

function buildGroup(cfg: CollectionConfig): DocGroup {
  const subgroups = Object.values(collections)
    .filter(c => c.parent === cfg.name && isDocsCollection(c))
    .map(buildGroup)
    .filter(g => g.items.length > 0 || g.subgroups.length > 0);

  return {
    name: cfg.name,
    title: titleCase(cfg.name.split('/').pop() as string),
    url: cfg.urlPrefix,
    description: cfg.description,
    items: readItems(cfg),
    subgroups,
  };
}

function flatten(groups: DocGroup[]): DocItem[] {
  const out: DocItem[] = [];
  for (const g of groups) {
    out.push(...g.items);
    out.push(...flatten(g.subgroups));
  }
  return out;
}

let cached: DocsTree | null = null;

export function getDocsTree(): DocsTree {
  if (cached) return cached;
  const groups = Object.values(collections)
    .filter(c => isDocsCollection(c) && !c.parent)
    .map(buildGroup)
    .filter(g => g.items.length > 0 || g.subgroups.length > 0);
  cached = { groups, flatList: flatten(groups) };
  return cached;
}

export function findDocByUrl(url: string): DocItem | null {
  return getDocsTree().flatList.find(p => p.url === url) ?? null;
}

// Find a group or sub-group by its collection name (e.g. "conventions" or
// "conventions/naming").
export function findGroup(name: string): DocGroup | null {
  for (const g of getDocsTree().groups) {
    if (g.name === name) return g;
    const sub = g.subgroups.find(s => s.name === name);
    if (sub) return sub;
  }
  return null;
}

// Breadcrumb trail for a group index page (Docs → [parent group] → group).
// The last crumb is the current group (no href).
export function groupCrumbs(name: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: 'Docs', href: '/docs' }];
  for (const g of getDocsTree().groups) {
    if (g.name === name) {
      crumbs.push({ label: g.title });
      return crumbs;
    }
    const sub = g.subgroups.find(s => s.name === name);
    if (sub) {
      crumbs.push({ label: g.title, href: g.url });
      crumbs.push({ label: sub.title });
      return crumbs;
    }
  }
  return crumbs;
}

export function findPrevNext(url: string): { prev: DocItem | null; next: DocItem | null } {
  const { flatList } = getDocsTree();
  const idx = flatList.findIndex(p => p.url === url);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flatList[idx - 1] : null,
    next: idx < flatList.length - 1 ? flatList[idx + 1] : null,
  };
}

// Breadcrumb trail (Docs → Group → [Subgroup] → current) for a doc URL.
export function docCrumbs(url: string): { label: string; href?: string }[] {
  const tree = getDocsTree();
  const crumbs: { label: string; href?: string }[] = [{ label: 'Docs', href: '/docs' }];
  for (const g of tree.groups) {
    if (g.items.some(i => i.url === url)) {
      crumbs.push({ label: g.title, href: g.url });
      break;
    }
    const sub = g.subgroups.find(s => s.items.some(i => i.url === url));
    if (sub) {
      crumbs.push({ label: g.title, href: g.url });
      crumbs.push({ label: sub.title, href: sub.url });
      break;
    }
  }
  const current = findDocByUrl(url);
  if (current) crumbs.push({ label: current.title });
  return crumbs;
}
