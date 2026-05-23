/**
 * Converts Obsidian wikilinks to website-compatible markdown links.
 *
 * Syntaxes:
 *
 * 1. **Qualified-path** (the Co-Goods convention): the first segment is
 *    a collection name from the content-repo folder layout. The URL is
 *    built using that collection's URL prefix (which may not match the
 *    folder name).
 *
 *      [[wiki/network-coordination]]
 *        → /resources/wiki/network-coordination
 *
 *      [[essays/on-collaboration]]
 *        → /thinking/essays/on-collaboration
 *
 *      [[insights/asynchronous-coordination-density]]
 *        → /research/insights/asynchronous-coordination-density
 *
 *      [[people/jane-doe|Jane Doe]]
 *        → /people/jane-doe (link text: "Jane Doe")
 *
 *      [[library/publishers/example-press]]
 *        → /library/publishers/example-press (multi-segment path)
 *
 * 2. **Bare-slug** (no slash): falls through to /topics/<slug>. The
 *    topic-aggregation page is the natural concept-level destination
 *    for an unqualified reference. Build-time validation against a
 *    slug index is a later phase.
 */

import { collections, CollectionName, getCollection } from './content/collections';

const KNOWN_COLLECTIONS = new Set<string>(Object.keys(collections));

function isQualified(linkPath: string): boolean {
  if (!linkPath.includes('/')) return false;
  const first = linkPath.split('/')[0];
  return KNOWN_COLLECTIONS.has(first);
}

// Build the website URL for a qualified path like "wiki/<slug>" or
// "library/publishers/<slug>". Uses the collection's urlPrefix + remaining
// segments verbatim. For collections with multi-segment URL paths (e.g.
// library nested under /library/publishers/), the urlPrefix is /library
// and the remaining segments are joined to it.
function buildUrlFromQualifiedPath(linkPath: string): string {
  const [collectionName, ...rest] = linkPath.split('/');
  const cfg = getCollection(collectionName);
  if (!cfg) return `/${linkPath}`;
  return `${cfg.urlPrefix}/${rest.join('/')}`;
}

// Mask out code regions (fenced ```...``` and inline `...`) before running
// the wikilink regex, so wikilinks inside code stay as literal syntax
// rather than getting rewritten into link syntax. After processing,
// restore the originals.
function withCodeRegionsMasked(content: string, transform: (s: string) => string): string {
  const placeholders: string[] = [];
  const masked = content.replace(/(```[\s\S]*?```|`[^`\n]*`)/g, match => {
    placeholders.push(match);
    return `\x00CODE_${placeholders.length - 1}\x00`;
  });

  let result = transform(masked);
  for (let i = 0; i < placeholders.length; i++) {
    result = result.replace(`\x00CODE_${i}\x00`, placeholders[i]);
  }
  return result;
}

function transformWikilinks(content: string): string {
  // 1. Wikilink with display text: [[path|Display]]
  content = content.replace(
    /\[\[([a-z0-9\-/]+)\|([^\]]+)\]\]/g,
    (_match, linkPath, display) => {
      if (isQualified(linkPath)) {
        return `[${display}](${buildUrlFromQualifiedPath(linkPath)})`;
      }
      return `[${display}](/topics/${linkPath})`;
    },
  );

  // 2. Wikilink without display text: [[path]]
  content = content.replace(
    /\[\[([a-z0-9\-/]+)\]\]/g,
    (_match, linkPath) => {
      if (isQualified(linkPath)) {
        const lastSegment = linkPath.split('/').pop();
        return `[${lastSegment}](${buildUrlFromQualifiedPath(linkPath)})`;
      }
      return `[${linkPath}](/topics/${linkPath})`;
    },
  );

  return content;
}

export function processObsidianLinks(content: string): string {
  return withCodeRegionsMasked(content, transformWikilinks);
}

// Re-exported for use by other modules if they need the canonical list.
export const _knownCollections: Set<string> = KNOWN_COLLECTIONS;
export type _CollectionName = CollectionName;
