import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CONTENT_ROOT } from './paths';

// The glossary is the canonical anchor for every concept (tags + topics are
// roles on glossary entries, not collections). This module loads the glossary
// once into a lookup that the resolver, link processor, refs, enforcement,
// and the tag/topic/portal renderers all read from.
//
// Entries live in alphabetical letter-folders: resources/glossary/<letter>/<slug>.md
// (non-alphabetic first char → `_`). URLs stay flat: /resources/glossary/<slug>.

export const GLOSSARY_FOLDER = 'resources/glossary';
const GLOSSARY_DIR = path.join(CONTENT_ROOT, GLOSSARY_FOLDER);

export interface GlossaryEntry {
  slug: string;
  title: string;
  type?: string;          // word | term | comparison
  tag: boolean;
  topic: boolean;
  aliases: string[];
  relatedTerms: string[];
  definition?: string;    // the first sense's first definition (for previews)
  filepath: string;
}

// The letter-folder a slug lives in (first char if a–z, else `_`).
export function glossaryLetter(slug: string): string {
  const c = slug[0]?.toLowerCase() ?? '_';
  return c >= 'a' && c <= 'z' ? c : '_';
}

// The on-disk path for a glossary slug (does not check existence).
export function glossaryFilePath(slug: string): string {
  return path.join(GLOSSARY_DIR, glossaryLetter(slug), `${slug}.md`);
}

function aliasKey(a: string): string {
  return a.trim().toLowerCase().replace(/\s+/g, '-');
}

let _cache: { bySlug: Map<string, GlossaryEntry>; byAlias: Map<string, string> } | null = null;

function load(): { bySlug: Map<string, GlossaryEntry>; byAlias: Map<string, string> } {
  if (_cache) return _cache;
  const bySlug = new Map<string, GlossaryEntry>();
  const byAlias = new Map<string, string>();

  if (fs.existsSync(GLOSSARY_DIR)) {
    for (const letter of fs.readdirSync(GLOSSARY_DIR)) {
      const letterDir = path.join(GLOSSARY_DIR, letter);
      if (!fs.statSync(letterDir).isDirectory()) continue;
      for (const file of fs.readdirSync(letterDir)) {
        if (!file.endsWith('.md') || file.startsWith('_') || file.startsWith('template-')) continue;
        const filepath = path.join(letterDir, file);
        let data: Record<string, unknown> = {};
        try {
          data = matter(fs.readFileSync(filepath, 'utf8')).data;
        } catch {
          continue;
        }
        const slug = String(data.slug || file.replace(/\.md$/, ''));
        const rel = (data.relationships as { related_terms?: unknown }) || {};
        const firstClass = Array.isArray(data.classes) ? data.classes[0] : undefined;
        const firstDef = firstClass && Array.isArray(firstClass.definitions)
          ? firstClass.definitions.find((d: unknown) => typeof d === 'string' && d.trim())
          : undefined;
        const entry: GlossaryEntry = {
          slug,
          title: String(data.title || data.name || slug),
          type: data.type ? String(data.type) : undefined,
          tag: data.tag === true,
          topic: data.topic === true,
          aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
          relatedTerms: Array.isArray(rel.related_terms) ? rel.related_terms.map(String) : [],
          definition: typeof firstDef === 'string' ? firstDef : undefined,
          filepath,
        };
        bySlug.set(slug, entry);
        for (const a of entry.aliases) byAlias.set(aliasKey(a), slug);
      }
    }
  }

  _cache = { bySlug, byAlias };
  return _cache;
}

// Look up by slug, falling back to alias → host entry.
export function getGlossaryEntry(slug: string): GlossaryEntry | null {
  const { bySlug, byAlias } = load();
  if (bySlug.has(slug)) return bySlug.get(slug)!;
  const host = byAlias.get(aliasKey(slug));
  return host ? bySlug.get(host) ?? null : null;
}

export function glossaryHasEntry(slug: string): boolean {
  return getGlossaryEntry(slug) !== null;
}

export function allGlossaryEntries(): GlossaryEntry[] {
  return [...load().bySlug.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function allTags(): GlossaryEntry[] {
  return allGlossaryEntries().filter(e => e.tag);
}

export function allTopics(): GlossaryEntry[] {
  return allGlossaryEntries().filter(e => e.topic);
}

// Canonical URL for a bare concept reference: the topic hub if the entry is a
// topic, else the glossary entry. Returns null if there is no such concept
// (the caller decides whether that is a build error).
export function conceptUrl(slugOrAlias: string): string | null {
  const e = getGlossaryEntry(slugOrAlias);
  if (!e) return null;
  return e.topic ? `/topics/${e.slug}` : `/resources/glossary/${e.slug}`;
}
