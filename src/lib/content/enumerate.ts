import fs from 'fs';
import path from 'path';
import { getDocsTree } from './docs';
import { isCollectionEnabled } from '@/site.config';
import { collections, getCollection } from './collections';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function listMdSlugs(folder: string): string[] {
  const dir = path.join(CONTENT_ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('template-') && !f.startsWith('_'))
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
  const reportsRoot = path.join(CONTENT_ROOT, 'reports');
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

// Convert a collection's urlPrefix + slug-segments into the param-array
// shape that Next.js's [...slug] route expects.
function urlToSlugSegments(url: string): string[] {
  return url.replace(/^\//, '').split('/').filter(Boolean);
}

// Enumerate all URL-segment arrays the catch-all route can render. Used by
// the route's generateStaticParams to pre-render every known content page
// at build time.
export function enumerateAllParams(): { slug: string[] }[] {
  const params: { slug: string[] }[] = [];

  // Umbrella landings (always reachable when dev mode, or enabled)
  for (const umbrella of ['thinking', 'resources', 'research']) {
    if (isCollectionEnabled(umbrella) || isCollectionEnabled('wiki') ||
        isCollectionEnabled('essays') || isCollectionEnabled('insights')) {
      // Show umbrella when any child is enabled (or umbrella explicitly enabled)
      params.push({ slug: [umbrella] });
    }
  }

  // Docs
  if (isCollectionEnabled('docs')) {
    params.push({ slug: ['docs'] });
    const tree = getDocsTree();
    for (const category of tree.categories) {
      params.push({ slug: ['docs', category.name] });
    }
    for (const page of tree.flatList) {
      params.push({ slug: page.url.replace(/^\//, '').split('/') });
    }
  }

  // Flat-folder collections — enumerate via their urlPrefix
  const flatCollections = [
    'wiki', 'glossary', 'essays', 'insights', 'observations', 'hypotheses',
    'people', 'organizations', 'tags',
  ] as const;
  for (const name of flatCollections) {
    if (!isCollectionEnabled(name)) continue;
    const cfg = getCollection(name);
    if (!cfg) continue;
    const prefixSegments = urlToSlugSegments(cfg.urlPrefix);
    params.push({ slug: prefixSegments });
    for (const slug of listMdSlugs(cfg.folder)) {
      params.push({ slug: [...prefixSegments, slug] });
    }
  }

  // Library — nested under /library + sub-indexes
  if (isCollectionEnabled('library')) {
    const cfg = collections.library;
    const prefix = urlToSlugSegments(cfg.urlPrefix);
    params.push({ slug: prefix });
    for (const slug of listMdSlugs('library')) {
      params.push({ slug: [...prefix, slug] });
    }
    if (fs.existsSync(path.join(CONTENT_ROOT, 'library', 'publishers'))) {
      params.push({ slug: [...prefix, 'publishers'] });
      for (const slug of listMdSlugs('library/publishers')) {
        params.push({ slug: [...prefix, 'publishers', slug] });
      }
    }
    if (fs.existsSync(path.join(CONTENT_ROOT, 'library', 'publications'))) {
      params.push({ slug: [...prefix, 'publications'] });
      for (const slug of listMdSlugs('library/publications')) {
        params.push({ slug: [...prefix, 'publications', slug] });
      }
    }
  }

  // Blog
  if (isCollectionEnabled('blog')) {
    const prefix = urlToSlugSegments(collections.blog.urlPrefix);
    params.push({ slug: prefix });
    for (const { slug } of listBlogSlugs()) {
      params.push({ slug: [...prefix, slug] });
    }
  }

  // Reports
  if (isCollectionEnabled('reports')) {
    const prefix = urlToSlugSegments(collections.reports.urlPrefix);
    params.push({ slug: prefix });
    for (const reportPath of listReportPaths()) {
      params.push({ slug: [...prefix, ...reportPath] });
    }
  }

  // Contributing
  if (isCollectionEnabled('contributing')) {
    if (fs.existsSync(path.join(CONTENT_ROOT, 'CONTRIBUTING.md'))) {
      params.push({ slug: ['contributing'] });
    }
  }

  // Manifesto (single-file collection — lives under thinking/)
  if (isCollectionEnabled('manifesto')) {
    if (fs.existsSync(path.join(CONTENT_ROOT, 'thinking', 'manifesto.md'))) {
      params.push({ slug: ['thinking', 'manifesto'] });
    }
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
  if (isCollectionEnabled('research') || isCollectionEnabled('library')) {
    params.push({ slug: ['research', 'sources'] });
  }
  if (isCollectionEnabled('research') || isCollectionEnabled('tags')) {
    params.push({ slug: ['research', 'tags'] });
  }
  if (isCollectionEnabled('research') || isCollectionEnabled('people')) {
    params.push({ slug: ['research', 'authors'] });
  }

  // /topics — index only
  if (isCollectionEnabled('topics')) {
    params.push({ slug: ['topics'] });
  }

  return params;
}
