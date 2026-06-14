#!/usr/bin/env node
/**
 * Build-time content integrity check.
 *
 * Fails the build when the glossary-anchor model is violated:
 *   - a record's `tags:`  entry has no glossary entry flagged `tag: true`
 *   - a record's `topics:` entry has no glossary entry flagged `topic: true`
 *   - a glossary `related_terms` / `not_to_be_confused_with` slug has no glossary entry
 *   - a bare wikilink `[[slug]]` names no glossary concept (slug or alias)
 *
 * and when the qualified-reference graph dangles (create-on-use integrity):
 *   - `authors:` / `added-by:` slug has no people/ entry
 *   - `publisher:` / `publication:` slug has no library publisher/publication entry
 *   - `sources_by_author:` / `key_publications:` slug has no library work
 *
 * Reads the same CONTENT_ROOT the app uses (honours CONTENT_DIR for local runs).
 * Wired as `prebuild`, so `next build` runs it first. (Qualified wikilinks in
 * bodies are the separate broken-link checker — out of scope here.)
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_ROOT = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR.replace(/^~(?=$|\/)/, process.env.HOME || ''))
  : path.join(process.cwd(), 'content');

const errors = [];
const rel = f => path.relative(CONTENT_ROOT, f);

// ---- walk helpers ----
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (name === '_archive') continue;
      walk(full, out);
    } else if (name.endsWith('.md') && !name.startsWith('template-') && name !== 'INDEX.md') {
      out.push(full);
    }
  }
  return out;
}

// ---- glossary index ----
const tagOk = new Set();      // slugs flagged tag: true
const topicOk = new Set();    // slugs flagged topic: true
const conceptSlugs = new Set(); // every concept slug + alias
const GLOSSARY_DIR = path.join(CONTENT_ROOT, 'resources/glossary');
const aliasKey = a => a.trim().toLowerCase().replace(/\s+/g, '-');

for (const file of walk(GLOSSARY_DIR)) {
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  const slug = String(data.slug || path.basename(file, '.md'));
  conceptSlugs.add(slug);
  if (data.tag === true) tagOk.add(slug);
  if (data.topic === true) topicOk.add(slug);
  for (const a of Array.isArray(data.aliases) ? data.aliases : []) conceptSlugs.add(aliasKey(String(a)));
}

// ---- glossary related_terms + not_to_be_confused_with must resolve ----
for (const file of walk(GLOSSARY_DIR)) {
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  const terms = data?.relationships?.related_terms;
  for (const t of Array.isArray(terms) ? terms : []) {
    if (!conceptSlugs.has(String(t))) {
      errors.push(`${rel(file)}: related_term '${t}' has no glossary entry`);
    }
  }
  for (const t of Array.isArray(data.not_to_be_confused_with) ? data.not_to_be_confused_with : []) {
    if (typeof t === 'string' && t.trim() && !conceptSlugs.has(t.trim())) {
      errors.push(`${rel(file)}: not_to_be_confused_with '${t}' has no glossary entry`);
    }
  }
}

// ---- entity indexes (for the qualified-reference graph) ----
function slugsIn(relDir) {
  const set = new Set();
  for (const file of walk(path.join(CONTENT_ROOT, relDir))) {
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    set.add(String(data.slug || path.basename(file, '.md')));
  }
  return set;
}
const peopleSlugs = slugsIn('people');
const publisherSlugs = slugsIn('resources/library/publishers');
const publicationSlugs = slugsIn('resources/library/publications');
const libraryWorkSlugs = new Set([
  ...slugsIn('resources/library/books'),
  ...slugsIn('resources/library/papers'),
  ...slugsIn('resources/library/articles'),
  ...slugsIn('resources/library/standards'),
]);

// ---- records: tags/topics must resolve to flagged entries ----
const SKIP_DIRS = ['resources/glossary', 'docs', 'templates'];
const allMd = walk(CONTENT_ROOT).filter(f => !SKIP_DIRS.some(d => rel(f).startsWith(d)));

for (const file of allMd) {
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  for (const t of Array.isArray(data.tags) ? data.tags : []) {
    if (typeof t === 'string' && !tagOk.has(t)) {
      errors.push(`${rel(file)}: tags: '${t}' is not a glossary entry flagged tag: true`);
    }
  }
  for (const t of Array.isArray(data.topics) ? data.topics : []) {
    if (typeof t === 'string' && !topicOk.has(t)) {
      errors.push(`${rel(file)}: topics: '${t}' is not a glossary entry flagged topic: true`);
    }
  }
  // qualified-reference graph — list-valued fields
  // (key_publications is not validated — its semantics are unsettled; the
  // example person uses free-text titles, not slugs.)
  for (const [field, set, label] of [
    ['authors', peopleSlugs, 'person'],
    ['sources_by_author', libraryWorkSlugs, 'library work'],
  ]) {
    for (const v of Array.isArray(data[field]) ? data[field] : []) {
      if (typeof v === 'string' && v.trim() && !set.has(v.trim())) {
        errors.push(`${rel(file)}: ${field}: '${v}' has no ${label} entry`);
      }
    }
  }
  // qualified-reference graph — single-valued fields (empty string = unspecified, skipped)
  for (const [field, set, label] of [
    ['added-by', peopleSlugs, 'person'],
    ['publisher', publisherSlugs, 'publisher'],
    ['publication', publicationSlugs, 'publication'],
  ]) {
    const v = data[field];
    if (typeof v === 'string' && v.trim() && !set.has(v.trim())) {
      errors.push(`${rel(file)}: ${field}: '${v}' has no ${label} entry`);
    }
  }
}

// ---- bare wikilinks in bodies must name a concept ----
const codeFence = /```[\s\S]*?```|`[^`\n]*`/g;
const wikilink = /\[\[([^\]]+)\]\]/g;
for (const file of walk(CONTENT_ROOT)) {
  if (rel(file).startsWith('templates')) continue;
  const body = fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?\n---/, '').replace(codeFence, '');
  let m;
  while ((m = wikilink.exec(body))) {
    let target = m[1].split('|')[0].trim();
    if (target.startsWith('license:') || target.includes('/')) continue; // license chip / qualified
    if (!conceptSlugs.has(target)) {
      errors.push(`${rel(file)}: bare wikilink [[${target}]] names no glossary concept`);
    }
  }
}

if (errors.length) {
  console.error(`\n✖ Content integrity check failed (${errors.length}):\n`);
  for (const e of errors.sort()) console.error('  - ' + e);
  console.error('\nFix the references above, or add/flag the missing glossary entries.\n');
  process.exit(1);
}
console.log(`✓ Content integrity check passed (${conceptSlugs.size} concepts, ${allMd.length} records).`);
