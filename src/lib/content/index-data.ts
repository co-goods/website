import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getDocsTree, DocCategory } from './docs';
import { collections, getCollection, CollectionName } from './collections';

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

function readMeta(filepath: string): {
  title: string;
  summary?: string;
  frontmatter: Record<string, unknown>;
} {
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);

  let title: string;
  if (typeof data.title === 'string' && data.title.trim()) {
    title = data.title.trim();
  } else if (typeof data.name === 'string' && data.name.trim()) {
    title = data.name.trim();
  } else {
    const h1 = content.split('\n').find(l => l.startsWith('# '));
    title = h1 ? h1.replace(/^#\s+/, '').trim() : path.basename(filepath, '.md');
  }

  const summary =
    (typeof data.summary === 'string' && data.summary) ||
    (typeof data.description === 'string' && data.description) ||
    undefined;

  return { title, summary, frontmatter: data };
}

function listFolderAsIndex(
  folder: string,
  urlPrefix: string,
  title: string,
  description?: string,
  filter?: (frontmatter: Record<string, unknown>) => boolean,
): IndexData {
  const dir = path.join(CONTENT_ROOT, folder);
  if (!fs.existsSync(dir)) return { title, description, items: [] };

  const items: IndexItem[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('template-') || file.startsWith('_')) continue;
    if (file === 'INDEX.md') continue;
    const slug = file.replace(/\.md$/, '');
    const filepath = path.join(dir, file);
    const meta = readMeta(filepath);
    if (filter && !filter(meta.frontmatter)) continue;
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

function urlPrefixOf(name: CollectionName): string {
  return collections[name].urlPrefix;
}

function folderOf(name: CollectionName): string {
  return collections[name].folder;
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
      return listFolderAsIndex(folderOf('wiki'), urlPrefixOf('wiki'), 'Wiki', 'Neutral, encyclopedic articles.');
    case 'essays':
      return listFolderAsIndex(folderOf('essays'), urlPrefixOf('essays'), 'Essays', 'POV writing.');
    case 'insights':
      return listFolderAsIndex(folderOf('insights'), urlPrefixOf('insights'), 'Insights', 'Atomic research findings.');
    case 'observations':
      return listFolderAsIndex(folderOf('observations'), urlPrefixOf('observations'), 'Observations', 'External signals from the world.');
    case 'hypotheses':
      return listFolderAsIndex(folderOf('hypotheses'), urlPrefixOf('hypotheses'), 'Hypotheses', 'Testable predictions.');
    case 'glossary':
      return listFolderAsIndex(folderOf('glossary'), urlPrefixOf('glossary'), 'Glossary', 'Term definitions.');
    case 'people':
      // Hide cited-author / external-author profiles from the People index.
      return listFolderAsIndex(
        folderOf('people'),
        urlPrefixOf('people'),
        'People',
        'Profiles of people involved in Co-Goods.',
        fm => {
          const a = typeof fm.affiliation === 'string' ? fm.affiliation : '';
          return a !== 'cited-author' && a !== 'external-author';
        },
      );
    case 'organizations':
      return listFolderAsIndex(folderOf('organizations'), urlPrefixOf('organizations'), 'Organizations', 'Organisations involved with Co-Goods.');
    case 'tags':
      return listFolderAsIndex(folderOf('tags'), urlPrefixOf('tags'), 'Tags', 'Operational labels.');
    case 'books':
      return listFolderAsIndex(folderOf('books'), urlPrefixOf('books'), 'Books');
    case 'papers':
      return listFolderAsIndex(folderOf('papers'), urlPrefixOf('papers'), 'Papers');
    case 'publishers':
      return listFolderAsIndex(folderOf('publishers'), urlPrefixOf('publishers'), 'Publishers');
    case 'publications':
      return listFolderAsIndex(folderOf('publications'), urlPrefixOf('publications'), 'Publications');
    case 'blog': {
      const blogRoot = path.join(CONTENT_ROOT, folderOf('blog'));
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
              const meta = readMeta(path.join(monthPath, file));
              items.push({
                url: `${urlPrefixOf('blog')}/${slug}`,
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
      const reportsRoot = path.join(CONTENT_ROOT, folderOf('reports'));
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
          const meta = readMeta(filepath);
          items.push({
            url: `${urlPrefixOf('reports')}/${slug}`,
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
      return { title: 'Topics', description: 'Cross-collection topic pages.', items: [] };
    default: {
      // Generic fallback: any bare-slug collection with a non-empty folder
      // gets a simple listing. Covers the docs collections (conventions,
      // schemas, contributing) and any future collection registered without
      // a dedicated case here.
      const cfg = getCollection(name);
      if (cfg && cfg.folder && cfg.resolver === 'bare-slug') {
        return listFolderAsIndex(cfg.folder, cfg.urlPrefix, name);
      }
      return { title: name, items: [] };
    }
  }
}

// ---------- Derived views ----------

// /research/authors — people with affiliation in cited-author /
// external-author / unclaimed (inverse of the /people index filter)
export function getResearchAuthorsIndex(): IndexData {
  return listFolderAsIndex(
    folderOf('people'),
    urlPrefixOf('people'),
    'Authors',
    'Cited and external authors referenced in Co-Goods research.',
    fm => {
      const a = typeof fm.affiliation === 'string' ? fm.affiliation : '';
      return a === 'cited-author' || a === 'external-author' || a === 'unclaimed';
    },
  );
}

// /research/sources — library entries (books + papers) flagged is-cited: true
export function getResearchSourcesIndex(): IndexData {
  const cited = (fm: Record<string, unknown>) => fm['is-cited'] === true;
  const books = listFolderAsIndex(folderOf('books'), urlPrefixOf('books'), '', '', cited);
  const papers = listFolderAsIndex(folderOf('papers'), urlPrefixOf('papers'), '', '', cited);
  return {
    title: 'Sources',
    description: 'Cited sources used in Co-Goods research.',
    items: [...books.items, ...papers.items],
  };
}

// /research/tags — tags actually used by any research-collection item
export function getResearchTagsIndex(): IndexData {
  const researchCollections: CollectionName[] = ['insights', 'observations', 'hypotheses', 'reports'];
  const usedTags = new Set<string>();

  for (const name of researchCollections) {
    const dir = path.join(CONTENT_ROOT, folderOf(name));
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      try {
        const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (Array.isArray(data.tags)) {
          for (const t of data.tags) {
            if (typeof t === 'string') usedTags.add(t);
          }
        }
      } catch {
        // skip malformed files
      }
    }
  }

  // Read each tag's frontmatter (if it exists in content/tags/) for the title.
  const items: IndexItem[] = [];
  for (const tag of usedTags) {
    const filepath = path.join(CONTENT_ROOT, folderOf('tags'), `${tag}.md`);
    if (fs.existsSync(filepath)) {
      const meta = readMeta(filepath);
      items.push({
        url: `${urlPrefixOf('tags')}/${tag}`,
        slug: tag,
        title: meta.title,
        summary: meta.summary,
      });
    } else {
      // Tag file doesn't exist but the slug is used; emit a stub entry
      items.push({
        url: `${urlPrefixOf('tags')}/${tag}`,
        slug: tag,
        title: tag,
      });
    }
  }

  items.sort((a, b) => a.title.localeCompare(b.title));
  return {
    title: 'Tags',
    description: 'Tags that appear in Co-Goods research collections.',
    items,
  };
}

// ---------- Umbrella landings ----------

export interface UmbrellaSection {
  heading: string;
  description?: string;
  url: string;
}

export interface UmbrellaIndexData {
  name: 'thinking' | 'resources' | 'research' | 'docs' | 'library';
  title: string;
  description: string;
  sections: UmbrellaSection[];
}

export function getUmbrellaIndex(
  name: 'thinking' | 'resources' | 'research' | 'docs' | 'library',
): UmbrellaIndexData {
  switch (name) {
    case 'docs':
      return {
        name,
        title: 'Documentation',
        description:
          'How content is organised in this repo — taxonomy, schemas, contributing guides.',
        sections: [
          { heading: 'Conventions', url: urlPrefixOf('conventions'), description: 'Taxonomy, frontmatter, file naming, wikilinks.' },
          { heading: 'Schemas', url: urlPrefixOf('schemas'), description: 'Per-collection schema references.' },
          { heading: 'Contributing', url: urlPrefixOf('contributing'), description: 'How to contribute content.' },
        ],
      };
    case 'library':
      return {
        name,
        title: 'Library',
        description:
          'Bibliographic items — books, papers, publishers, and publications.',
        sections: [
          { heading: 'Books', url: urlPrefixOf('books'), description: 'Books in the Co-Goods library.' },
          { heading: 'Papers', url: urlPrefixOf('papers'), description: 'Papers in the Co-Goods library.' },
          { heading: 'Publishers', url: urlPrefixOf('publishers'), description: 'Publishers of works in the library.' },
          { heading: 'Publications', url: urlPrefixOf('publications'), description: 'Journals and channels carrying library items.' },
        ],
      };
    case 'thinking':
      return {
        name,
        title: 'Thinking',
        description:
          'Where we make a case — essays, manifesto, and (later) audio and video pieces. Our voice.',
        sections: [
          { heading: 'Essays', url: urlPrefixOf('essays'), description: 'POV writing on co-goods, antirival goods, and adjacent themes.' },
          { heading: 'Manifesto', url: '/thinking/manifesto', description: 'The foundational statement.' },
        ],
      };
    case 'resources':
      return {
        name,
        title: 'Resources',
        description:
          'Things you can use — encyclopedic reference, term definitions, recommended reading, and (later) tools and templates.',
        sections: [
          { heading: 'Wiki', url: urlPrefixOf('wiki'), description: 'Concept reference, neutral and encyclopedic.' },
          { heading: 'Glossary', url: urlPrefixOf('glossary'), description: 'Definitions of terms used across the site.' },
          { heading: 'Library', url: '/resources/library', description: 'Recommended reading and reference.' },
        ],
      };
    case 'research':
      return {
        name,
        title: 'Research',
        description:
          'The epistemic chain — what we have observed, what we have synthesised, what we are testing.',
        sections: [
          { heading: 'Insights', url: urlPrefixOf('insights'), description: 'Atomic findings synthesising observations and sources.' },
          { heading: 'Observations', url: urlPrefixOf('observations'), description: 'External signals from the world.' },
          { heading: 'Hypotheses', url: urlPrefixOf('hypotheses'), description: 'Testable predictions building on insights.' },
          { heading: 'Reports', url: urlPrefixOf('reports'), description: 'Formal versioned compilations of research.' },
          { heading: 'Sources', url: '/research/sources', description: 'Library entries cited in research.' },
          { heading: 'Authors', url: '/research/authors', description: 'Cited and external authors referenced in research.' },
          { heading: 'Tags', url: '/research/tags', description: 'Tags appearing in research collections.' },
        ],
      };
  }
}
