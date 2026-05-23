import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getDocsTree, DocCategory } from './docs';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface IndexItem {
  url: string;
  title: string;
  summary?: string;
  slug: string;
}

export interface IndexData {
  title: string;
  description?: string;
  items: IndexItem[];
}

function readTitleAndSummary(filepath: string): { title: string; summary?: string } {
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);

  let title: string;
  if (typeof data.title === 'string' && data.title.trim()) {
    title = data.title.trim();
  } else {
    const h1 = content.split('\n').find(l => l.startsWith('# '));
    title = h1 ? h1.replace(/^#\s+/, '').trim() : path.basename(filepath, '.md');
  }

  const summary =
    (typeof data.summary === 'string' && data.summary) ||
    (typeof data.description === 'string' && data.description) ||
    undefined;

  return { title, summary };
}

function listFolderAsIndex(
  folder: string,
  urlPrefix: string,
  title: string,
  description?: string,
): IndexData {
  const dir = path.join(CONTENT_ROOT, folder);
  if (!fs.existsSync(dir)) return { title, description, items: [] };

  const items: IndexItem[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('template-') || file.startsWith('_')) continue;
    if (file === 'INDEX.md') continue;
    const slug = file.replace(/\.md$/, '');
    const filepath = path.join(dir, file);
    const meta = readTitleAndSummary(filepath);
    items.push({
      url: `${urlPrefix}/${slug}`,
      slug,
      title: meta.title,
      summary: meta.summary,
    });
  }

  items.sort((a, b) => a.title.localeCompare(b.title));
  return { title, description, items };
}

export function getDocsRootIndex() {
  return getDocsTree();
}

export function getDocsCategoryIndex(category: string): { category: DocCategory | null } {
  const tree = getDocsTree();
  const cat = tree.categories.find(c => c.name === category) ?? null;
  return { category: cat };
}

export function getCollectionIndex(name: string, subPath: string[]): IndexData {
  switch (name) {
    case 'wiki':
      return listFolderAsIndex('wiki', '/wiki', 'Wiki', 'Neutral, encyclopedic articles.');
    case 'essays':
      return listFolderAsIndex('essays', '/essays', 'Essays', 'Authored POV writing.');
    case 'insights':
      return listFolderAsIndex('insights', '/insights', 'Insights', 'Atomic research findings.');
    case 'observations':
      return listFolderAsIndex('observations', '/observations', 'Observations', 'External signals from the world.');
    case 'hypotheses':
      return listFolderAsIndex('hypotheses', '/hypotheses', 'Hypotheses', 'Testable predictions.');
    case 'glossary':
      return listFolderAsIndex('glossary', '/glossary', 'Glossary', 'Term definitions.');
    case 'people':
      return listFolderAsIndex('people', '/people', 'People', 'Profiles.');
    case 'tags':
      return listFolderAsIndex('tags', '/tags', 'Tags', 'Operational labels.');
    case 'library': {
      if (subPath[0] === 'publishers') {
        return listFolderAsIndex('library/publishers', '/library/publishers', 'Publishers');
      }
      if (subPath[0] === 'publications') {
        return listFolderAsIndex('library/publications', '/library/publications', 'Publications');
      }
      return listFolderAsIndex('library', '/library', 'Library', 'Bibliographic records — books, papers, podcasts, articles, videos, courses.');
    }
    case 'blog': {
      // Walk year/month subfolders and gather all posts.
      const blogRoot = path.join(CONTENT_ROOT, 'blog');
      const items: IndexItem[] = [];
      if (fs.existsSync(blogRoot)) {
        for (const year of fs.readdirSync(blogRoot)) {
          const yearPath = path.join(blogRoot, year);
          if (!fs.statSync(yearPath).isDirectory()) continue;
          for (const month of fs.readdirSync(yearPath)) {
            const monthPath = path.join(yearPath, month);
            if (!fs.statSync(monthPath).isDirectory()) continue;
            for (const file of fs.readdirSync(monthPath)) {
              if (!file.endsWith('.md')) continue;
              const slug = file.replace(/\.md$/, '');
              const meta = readTitleAndSummary(path.join(monthPath, file));
              items.push({
                url: `/blog/${slug}`,
                slug,
                title: meta.title,
                summary: meta.summary,
              });
            }
          }
        }
      }
      items.sort((a, b) => b.slug.localeCompare(a.slug));
      return { title: 'Blog', description: 'Project narrative.', items };
    }
    case 'reports': {
      const reportsRoot = path.join(CONTENT_ROOT, 'reports');
      const items: IndexItem[] = [];
      if (fs.existsSync(reportsRoot)) {
        for (const slug of fs.readdirSync(reportsRoot)) {
          const slugDir = path.join(reportsRoot, slug);
          if (!fs.statSync(slugDir).isDirectory()) continue;
          const versions = fs.readdirSync(slugDir)
            .filter(v => v.startsWith('v') && fs.statSync(path.join(slugDir, v)).isDirectory())
            .sort();
          if (!versions.length) continue;
          const latest = versions[versions.length - 1];
          const filepath = path.join(slugDir, latest, `${slug}.md`);
          if (!fs.existsSync(filepath)) continue;
          const meta = readTitleAndSummary(filepath);
          items.push({
            url: `/reports/${slug}`,
            slug,
            title: meta.title,
            summary: meta.summary,
          });
        }
      }
      items.sort((a, b) => a.title.localeCompare(b.title));
      return { title: 'Reports', description: 'Versioned formal compilations.', items };
    }
    case 'topics':
      // Topic aggregation is Phase 4 work — emit an empty index for now.
      return { title: 'Topics', description: 'Cross-collection topic pages.', items: [] };
    default:
      return { title: name, items: [] };
  }
}
