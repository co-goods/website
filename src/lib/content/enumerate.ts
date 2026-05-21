import fs from 'fs';
import path from 'path';
import { getDocsTree } from './docs';

const RESEARCH_ROOT = path.join(process.cwd(), 'research');

function listMdSlugs(folder: string): string[] {
  const dir = path.join(RESEARCH_ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('template-') && !f.startsWith('_'))
    .map(f => f.replace(/\.md$/, ''));
}

function listBlogSlugs(): { slug: string }[] {
  const blogRoot = path.join(RESEARCH_ROOT, 'blog');
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
  const reportsRoot = path.join(RESEARCH_ROOT, 'reports');
  if (!fs.existsSync(reportsRoot)) return [];
  const paths: string[][] = [];

  for (const slug of fs.readdirSync(reportsRoot)) {
    const slugDir = path.join(reportsRoot, slug);
    if (!fs.statSync(slugDir).isDirectory()) continue;
    const versions = fs.readdirSync(slugDir)
      .filter(v => v.startsWith('v') && fs.statSync(path.join(slugDir, v)).isDirectory())
      .sort();
    if (!versions.length) continue;

    // Latest-version stable URL
    paths.push([slug]);
    // Per-version URLs
    for (const v of versions) paths.push([slug, v]);
  }

  return paths;
}

// Enumerate all URL-segment arrays the catch-all route can render. Used by
// the route's generateStaticParams to pre-render every known content page
// at build time.
export function enumerateAllParams(): { slug: string[] }[] {
  const params: { slug: string[] }[] = [];

  // /docs/<category>/<slug>
  for (const page of getDocsTree().flatList) {
    params.push({ slug: page.url.replace(/^\//, '').split('/') });
  }

  // Simple-folder collections
  const bareCollections = [
    'wiki', 'essays', 'insights', 'observations', 'hypotheses',
    'glossary', 'people', 'tags',
  ];
  for (const folder of bareCollections) {
    for (const slug of listMdSlugs(folder)) {
      params.push({ slug: [folder, slug] });
    }
  }

  // /library/<slug>
  for (const slug of listMdSlugs('library')) {
    params.push({ slug: ['library', slug] });
  }
  // /library/publishers/<slug>
  for (const slug of listMdSlugs('library/publishers')) {
    params.push({ slug: ['library', 'publishers', slug] });
  }
  // /library/publications/<slug>
  for (const slug of listMdSlugs('library/publications')) {
    params.push({ slug: ['library', 'publications', slug] });
  }

  // /blog/<slug>
  for (const { slug } of listBlogSlugs()) {
    params.push({ slug: ['blog', slug] });
  }

  // /reports/<slug>[/<version>]
  for (const reportPath of listReportPaths()) {
    params.push({ slug: ['reports', ...reportPath] });
  }

  // /contributing
  if (fs.existsSync(path.join(RESEARCH_ROOT, 'CONTRIBUTING.md'))) {
    params.push({ slug: ['contributing'] });
  }

  return params;
}
