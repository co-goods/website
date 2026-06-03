/**
 * Converts Obsidian wikilinks to website-compatible markdown links.
 *
 * Syntaxes:
 *
 * 1. **Qualified-path** (the Co-Goods convention): the wikilink path
 *    mirrors the folder layout in the content repo. The URL is the same
 *    path with a leading slash. For example:
 *
 *      [[research/insights/foo]]
 *        → /research/insights/foo
 *
 *      [[resources/wiki/network-coordination]]
 *        → /resources/wiki/network-coordination
 *
 *      [[thinking/essays/on-collaboration]]
 *        → /thinking/essays/on-collaboration
 *
 *      [[people/jane-doe|Jane Doe]]
 *        → /people/jane-doe (link text: "Jane Doe")
 *
 *      [[resources/library/publishers/example-press]]
 *        → /resources/library/publishers/example-press
 *
 *    The first segment must be a recognised umbrella (`research`,
 *    `resources`, `thinking`) or a top-level collection name (`people`,
 *    `blog`, `tags`, `organizations`, `topics`, `docs`). Other shapes
 *    fall through to the topic page.
 *
 * 2. **Bare-slug** (no slash): falls through to /topics/<slug>. The
 *    topic-aggregation page is the natural concept-level destination
 *    for an unqualified reference. Build-time validation against a
 *    slug index is a later phase.
 */

import { collections, CollectionName } from './content/collections';
import { resolveLicense, licenseSentinel } from './licenses';

// First-segment vocabulary recognised in qualified wikilinks. Umbrellas
// + top-level collections.
const RECOGNISED_FIRST_SEGMENTS: Set<string> = new Set([
  'research',
  'resources',
  'thinking',
  'blog',
  'people',
  'organizations',
  'tags',
  'topics',
  'docs',
]);

function isQualified(linkPath: string): boolean {
  if (!linkPath.includes('/')) return false;
  const first = linkPath.split('/')[0];
  return RECOGNISED_FIRST_SEGMENTS.has(first);
}

// For a qualified wikilink path, the URL is simply the path with a
// leading slash. The folder structure in the content repo mirrors the
// URL groupings, so wikilink path === URL path.
function buildUrlFromQualifiedPath(linkPath: string): string {
  return `/${linkPath}`;
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
  // 0. Inline license reference: [[license:CC-BY-4.0]] → an inline license chip.
  //    Emits a sentinel (swapped for chip HTML after sanitization — see
  //    licenses.ts). Runs first; the generic handlers below only match lowercase,
  //    slash-only paths, so a license token (colon + uppercase) never reaches them.
  content = content.replace(
    /\[\[license:\s*([A-Za-z0-9.+-]+)(?:\|[^\]]+)?\]\]/g,
    (_match, id) => (resolveLicense(id) ? licenseSentinel(id) : id),
  );

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

// Re-exported for use by other modules if they need the recognised set.
export const _recognisedFirstSegments: Set<string> = RECOGNISED_FIRST_SEGMENTS;
export const _knownCollections: Set<string> = new Set<string>(Object.keys(collections));
export type _CollectionName = CollectionName;
