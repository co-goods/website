import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CONTENT_ROOT } from './paths';
import { collections, CollectionName } from './collections';
import { allTags, allTopics, getGlossaryEntry } from './glossary';
import type { IndexData, IndexItem } from './index-data';

// Tags and topics are glossary roles; their listing/hub pages are DERIVED from
// (a) the glossary anchors that carry the flag and (b) the records that
// reference a concept by slug in their `tags:` / `topics:` frontmatter.
//
//   tag listing  /tags/<slug>    — records whose `tags:`   include <slug>  ("touches on")
//   topic hub    /topics/<slug>  — records whose `topics:` include <slug>  ("is about")

// Content collections whose items can reference concepts. (Excludes glossary,
// docs, pages — and the derived tags/topics themselves.)
const RECORD_COLLECTIONS: CollectionName[] = [
  'wiki', 'essays',
  'observations', 'insights', 'hypotheses',
  'books', 'papers', 'publishers', 'publications', 'standards', 'articles',
  'people', 'organizations',
];

export interface RecordRef {
  url: string;
  slug: string;
  title: string;
  summary?: string;
  collection: CollectionName;
  tags: string[];
  topics: string[];
}

function titleFrom(data: Record<string, unknown>, content: string, slug: string): string {
  if (typeof data.title === 'string' && data.title.trim()) return data.title.trim();
  if (typeof data.name === 'string' && data.name.trim()) return data.name.trim();
  const h1 = content.split('\n').find(l => l.startsWith('# '));
  return h1 ? h1.replace(/^#\s+/, '').trim() : slug;
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function pushRecord(out: RecordRef[], name: CollectionName, filepath: string, url: string) {
  let parsed;
  try {
    parsed = matter(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return;
  }
  const { data, content } = parsed;
  const slug = path.basename(filepath, '.md');
  out.push({
    url,
    slug,
    title: titleFrom(data, content, slug),
    summary: typeof data.summary === 'string' ? data.summary : undefined,
    collection: name,
    tags: strList(data.tags),
    topics: strList(data.topics),
  });
}

let _records: RecordRef[] | null = null;

// All concept-referencing records, read once.
function allRecords(): RecordRef[] {
  if (_records) return _records;
  const out: RecordRef[] = [];

  for (const name of RECORD_COLLECTIONS) {
    const cfg = collections[name];
    const dir = path.join(CONTENT_ROOT, cfg.folder);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('template-') || file.startsWith('_') || file === 'INDEX.md') continue;
      const slug = file.replace(/\.md$/, '');
      pushRecord(out, name, path.join(dir, file), `${cfg.urlPrefix}/${slug}`);
    }
  }

  // Blog is nested blog/<year>/<month>/<slug>.md, flat URL /blog/<slug>.
  const blogRoot = path.join(CONTENT_ROOT, collections.blog.folder);
  if (fs.existsSync(blogRoot)) {
    for (const year of fs.readdirSync(blogRoot)) {
      const yp = path.join(blogRoot, year);
      if (!fs.statSync(yp).isDirectory()) continue;
      for (const month of fs.readdirSync(yp)) {
        const mp = path.join(yp, month);
        if (!fs.statSync(mp).isDirectory()) continue;
        for (const file of fs.readdirSync(mp)) {
          if (!file.endsWith('.md')) continue;
          const slug = file.replace(/\.md$/, '');
          pushRecord(out, 'blog', path.join(mp, file), `/blog/${slug}`);
        }
      }
    }
  }

  _records = out;
  return out;
}

// Human, singular labels per content type — used to group concept-hub members.
const TYPE_LABELS: Partial<Record<CollectionName, string>> = {
  wiki: 'Wiki', essays: 'Essay',
  observations: 'Observation', insights: 'Insight', hypotheses: 'Hypothesis',
  books: 'Book', papers: 'Paper', articles: 'Article', standards: 'Standard',
  publishers: 'Publisher', publications: 'Publication',
  people: 'Person', organizations: 'Organization', blog: 'Blog post',
};

function toItem(r: RecordRef): IndexItem {
  return {
    url: r.url, slug: r.slug, title: r.title, summary: r.summary,
    typeLabel: TYPE_LABELS[r.collection] ?? r.collection,
  };
}

// Records that reference a concept slug via tags: / topics:.
export function recordsTagging(slug: string): RecordRef[] {
  return allRecords().filter(r => r.tags.includes(slug));
}
export function recordsAbout(slug: string): RecordRef[] {
  return allRecords().filter(r => r.topics.includes(slug));
}

// ---------- Index + listing data for the catch-all ----------

// /tags — every glossary entry flagged tag: true.
export function getTagsIndex(): IndexData {
  const items: IndexItem[] = allTags().map(e => ({
    url: `/tags/${e.slug}`,
    slug: e.slug,
    title: e.title,
    summary: e.definition,
  }));
  return { title: 'Tags', description: 'Concepts used as content labels. Each is a glossary entry.', items };
}

// /topics — every glossary entry flagged topic: true.
export function getTopicsIndex(): IndexData {
  const items: IndexItem[] = allTopics().map(e => ({
    url: `/topics/${e.slug}`,
    slug: e.slug,
    title: e.title,
    summary: e.definition,
  }));
  return { title: 'Topics', description: 'Primary subjects, each with a hub aggregating what is about it.', items };
}

// /tags/<slug> — items that reference the tag.
export function getTagListing(slug: string): IndexData | null {
  const entry = getGlossaryEntry(slug);
  if (!entry || !entry.tag) return null;
  const glossaryRow: IndexItem = { url: `/resources/glossary/${entry.slug}`, slug: entry.slug, title: entry.title, typeLabel: 'Glossary' };
  return {
    title: entry.title,
    description: entry.definition ?? `Items tagged “${entry.title}”.`,
    items: [glossaryRow, ...recordsTagging(entry.slug).map(toItem).sort((a, b) => a.title.localeCompare(b.title))],
  };
}

// /topics/<slug> — the hub: items that are about the topic.
export function getTopicHub(slug: string): IndexData | null {
  const entry = getGlossaryEntry(slug);
  if (!entry || !entry.topic) return null;
  const glossaryRow: IndexItem = { url: `/resources/glossary/${entry.slug}`, slug: entry.slug, title: entry.title, typeLabel: 'Glossary' };
  return {
    title: entry.title,
    description: entry.definition ?? `What’s about “${entry.title}”.`,
    items: [glossaryRow, ...recordsAbout(entry.slug).map(toItem).sort((a, b) => a.title.localeCompare(b.title))],
  };
}

// ---------- Glossary portal facets ----------

// The library collections a concept may also be catalogued in (the SPDX case:
// a glossary concept whose work is a `standards` library entry).
const LIBRARY_COLLECTIONS: CollectionName[] = [
  'books', 'papers', 'articles', 'standards', 'publishers', 'publications',
];

export interface FacetPreview {
  count: number;
  preview: IndexItem[];
  url: string;
}

export interface FacetLinkItem {
  title: string;
  url: string;
  typeLabel?: string;
}

export interface GlossaryFacets {
  tag: boolean;
  topic: boolean;
  tagged?: FacetPreview;     // present when tag: true
  about?: FacetPreview;      // present when topic: true
  wiki?: FacetLinkItem;      // same-slug wiki article facet
  library?: FacetLinkItem;   // same-slug library work facet
}

function readTitle(filepath: string, fallback: string): string {
  try {
    const { data, content } = matter(fs.readFileSync(filepath, 'utf8'));
    if (typeof data.title === 'string' && data.title.trim()) return data.title.trim();
    if (typeof data.name === 'string' && data.name.trim()) return data.name.trim();
    const h1 = content.split('\n').find(l => l.startsWith('# '));
    if (h1) return h1.replace(/^#\s+/, '').trim();
  } catch { /* fall through */ }
  return fallback;
}

// The roles + same-slug facets the glossary "portal" surfaces for a concept.
export function getGlossaryFacets(slug: string): GlossaryFacets {
  const entry = getGlossaryEntry(slug);
  const facets: GlossaryFacets = { tag: !!entry?.tag, topic: !!entry?.topic };
  if (!entry) return facets;

  const PREVIEW = 4;
  if (entry.tag) {
    const tagged = recordsTagging(entry.slug).map(toItem).sort((a, b) => a.title.localeCompare(b.title));
    facets.tagged = { count: tagged.length, preview: tagged.slice(0, PREVIEW), url: `/tags/${entry.slug}` };
  }
  if (entry.topic) {
    const about = recordsAbout(entry.slug).map(toItem).sort((a, b) => a.title.localeCompare(b.title));
    facets.about = { count: about.length, preview: about.slice(0, PREVIEW), url: `/topics/${entry.slug}` };
  }

  // Same-slug wiki article facet.
  const wikiFile = path.join(CONTENT_ROOT, collections.wiki.folder, `${entry.slug}.md`);
  if (fs.existsSync(wikiFile)) {
    facets.wiki = { title: readTitle(wikiFile, entry.title), url: `${collections.wiki.urlPrefix}/${entry.slug}` };
  }
  // Same-slug library work facet (first match across library collections).
  for (const name of LIBRARY_COLLECTIONS) {
    const f = path.join(CONTENT_ROOT, collections[name].folder, `${entry.slug}.md`);
    if (fs.existsSync(f)) {
      facets.library = {
        title: readTitle(f, entry.title),
        url: `${collections[name].urlPrefix}/${entry.slug}`,
        typeLabel: TYPE_LABELS[name],
      };
      break;
    }
  }
  return facets;
}
