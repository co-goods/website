import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_ROOT = path.join(process.cwd(), 'research', 'docs');

export interface DocPage {
  url: string;          // /docs/<category>/<slug>
  filepath: string;
  category: string;     // bare category slug (prefix stripped)
  slug: string;         // bare doc slug (prefix stripped)
  order: number;
  categoryOrder: number;
  title: string;
}

export interface DocCategory {
  name: string;         // bare category slug
  order: number;
  pages: DocPage[];
}

export interface DocsTree {
  categories: DocCategory[];
  flatList: DocPage[];  // categories then pages, ordered for prev/next traversal
}

function parsePrefix(name: string): { order: number; bare: string } {
  const m = name.match(/^(\d+)-(.+)$/);
  if (m) return { order: parseInt(m[1], 10), bare: m[2] };
  return { order: 9999, bare: name };
}

function readTitle(filepath: string): string {
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);
  if (typeof data.title === 'string' && data.title.trim()) return data.title.trim();
  const h1 = content.split('\n').find(l => l.startsWith('# '));
  if (h1) return h1.replace(/^#\s+/, '').trim();
  return path.basename(filepath, '.md');
}

function buildTree(): DocsTree {
  const categories: DocCategory[] = [];

  if (!fs.existsSync(DOCS_ROOT)) {
    return { categories: [], flatList: [] };
  }

  for (const entry of fs.readdirSync(DOCS_ROOT)) {
    const entryPath = path.join(DOCS_ROOT, entry);
    if (!fs.statSync(entryPath).isDirectory()) continue;

    const { order: categoryOrder, bare: categoryName } = parsePrefix(entry);
    const pages: DocPage[] = [];

    for (const file of fs.readdirSync(entryPath)) {
      if (!file.endsWith('.md')) continue;
      const filepath = path.join(entryPath, file);
      const { order, bare } = parsePrefix(file.replace(/\.md$/, ''));
      pages.push({
        url: `/docs/${categoryName}/${bare}`,
        filepath,
        category: categoryName,
        slug: bare,
        order,
        categoryOrder,
        title: readTitle(filepath),
      });
    }

    pages.sort((a, b) => a.order - b.order);
    categories.push({ name: categoryName, order: categoryOrder, pages });
  }

  categories.sort((a, b) => a.order - b.order);

  const flatList = categories.flatMap(c => c.pages);
  return { categories, flatList };
}

let cached: DocsTree | null = null;

export function getDocsTree(): DocsTree {
  if (!cached) cached = buildTree();
  return cached;
}

export function findDocByUrl(url: string): DocPage | null {
  const tree = getDocsTree();
  return tree.flatList.find(p => p.url === url) ?? null;
}

export function findPrevNext(url: string): { prev: DocPage | null; next: DocPage | null } {
  const tree = getDocsTree();
  const idx = tree.flatList.findIndex(p => p.url === url);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? tree.flatList[idx - 1] : null,
    next: idx < tree.flatList.length - 1 ? tree.flatList[idx + 1] : null,
  };
}
