import fs from 'fs';
import path from 'path';
import { isCollectionEnabled } from '@/site.config';
import { collections, getCollection, CollectionName } from './collections';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function listMdSlugs(folder: string): string[] {
  if (!folder) return [];
  const dir = path.join(CONTENT_ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('template-') && !f.startsWith('_') && f !== 'INDEX.md')
    .map(f => f.replace(/\.md$/, ''));
}

function listBlogSlugs(): { slug: string }[] {
  const blogRoot = path.join(CONTENT_ROOT, 'blog');
  if (!fs.existsSync(blogRoot)) return [];
  const slugs: { slug: string }[] = [];
  for (const year of fs.readdirSync(blogRoot)) {
    const yearPath = path.join(blogRoot, year);
    if (!fs.statSync(yearPath).isDirectory()) continue;
    for (const month of fs.readdirSync(yearPath)) {
      const monthPath = path.join(yearPath, month);
      if (!fs.statSync(monthPath).isDirectory()) continue;
      for (const file of fs.readdirSync(monthPath)) {
        if (file.endsWith('.md')) {
          slugs.push({ slug: file.replace(/\.md$/, '') });
        }
      }
    }
  }
  return slugs;
}

function listReportPaths(): string[][] {
  const reportsRoot = path.join(CONTENT_ROOT, 'research', 'reports');
  if (!fs.existsSync(reportsRoot)) return [];
  const paths: string[][] = [];

  for (const slug of fs.readdirSync(reportsRoot)) {
    const slugDir = path.join(reportsRoot, slug);
    if (!fs.statSync(slugDir).isDirectory()) continue;
    const versions = fs.readdirSync(slugDir)
      .filter(v => v.startsWith('v') && fs.statSync(path.join(slugDir, v)).isDirectory())
      .sort();
    if (!versions.length) continue;

    paths.push([slug]);
    for (const v of versions) paths.push([slug, v]);
  }

  return paths;
}

// Convert a collection's urlPrefix into the param-array shape that Next.js's
// [...slug] route expects.
function urlToSlugSegments(url: string): string[] {
  return url.replace(/^\//, '').split('/').filter(Boolean);
}

// Enumerate all URL-segment arrays the catch-all route can render. Used by
// the route's generateStaticParams to pre-render every known content page
// at build time.
export function enumerateAllParams(): { slug: string[] }[] {
  const params: { slug: string[] }[] = [];

  // Umbrella / URL-grouping landings
  for (const grouping of ['thinking', 'resources', 'research', 'docs']) {
    if (isCollectionEnabled(grouping)) {
      params.push({ slug: [grouping] });
    }
  }
  if (isCollectionEnabled('books') || isCollectionEnabled('papers') ||
      isCollectionEnabled('publishers') || isCollectionEnabled('publications')) {
    params.push({ slug: ['resources', 'library'] });
  }

  // Bare-slug collections — enumerate each via its urlPrefix + folder
  const bareSlugCollections: CollectionName[] = [
    'wiki', 'glossary', 'essays',
    'observations', 'insights', 'hypotheses',
    'books', 'papers', 'publishers', 'publications',
    'conventions', 'schemas', 'contributing',
    'people', 'organizations', 'tags',
  ];
  for (const name of bareSlugCollections) {
    if (!isCollectionEnabled(name)) continue;
    const cfg = getCollection(name);
    if (!cfg) continue;
    const prefixSegments = urlToSlugSegments(cfg.urlPrefix);
    params.push({ slug: prefixSegments });
    for (const slug of listMdSlugs(cfg.folder)) {
      params.push({ slug: [...prefixSegments, slug] });
    }
  }

  // Blog (flattened URL)
  if (isCollectionEnabled('blog')) {
    const prefix = urlToSlugSegments(collections.blog.urlPrefix);
    params.push({ slug: prefix });
    for (const { slug } of listBlogSlugs()) {
      params.push({ slug: [...prefix, slug] });
    }
  }

  // Reports (folder-per-version)
  if (isCollectionEnabled('reports')) {
    const prefix = urlToSlugSegments(collections.reports.urlPrefix);
    params.push({ slug: prefix });
    for (const reportPath of listReportPaths()) {
      params.push({ slug: [...prefix, ...reportPath] });
    }
  }

  // Plain-page standalones (rendered via PlainPage layout, not collection items).
  if (fs.existsSync(path.join(CONTENT_ROOT, 'CONTRIBUTING.md'))) {
    params.push({ slug: ['contributing'] });
  }
  if (fs.existsSync(path.join(CONTENT_ROOT, 'thinking', 'manifesto.md'))) {
    params.push({ slug: ['thinking', 'manifesto'] });
  }

  // Composed pages — website/pages/<slug>.md served transparently at /<slug>.
  // home is excluded; it's served at / by app/page.tsx, not /home.
  if (isCollectionEnabled('pages')) {
    const pagesRoot = path.join(process.cwd(), 'pages');
    if (fs.existsSync(pagesRoot)) {
      for (const f of fs.readdirSync(pagesRoot)) {
        if (!f.endsWith('.md')) continue;
        const slug = f.replace(/\.md$/, '');
        if (slug === 'home') continue;
        params.push({ slug: [slug] });
      }
    }
  }

  // /research/sources, /research/tags, /research/authors derived views
  if (isCollectionEnabled('research') || isCollectionEnabled('books') || isCollectionEnabled('papers')) {
    params.push({ slug: ['research', 'sources'] });
  }
  if (isCollectionEnabled('research') || isCollectionEnabled('tags')) {
    params.push({ slug: ['research', 'tags'] });
  }
  if (isCollectionEnabled('research') || isCollectionEnabled('people')) {
    params.push({ slug: ['research', 'authors'] });
  }

  // /topics — index only (no items currently)
  if (isCollectionEnabled('topics')) {
    params.push({ slug: ['topics'] });
  }

  return params;
}
