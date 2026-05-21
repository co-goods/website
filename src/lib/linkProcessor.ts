/**
 * Converts Obsidian wikilinks to website-compatible markdown links.
 *
 * Syntaxes:
 *
 * 1. **Qualified-path** (the Co-Goods convention):
 *    - `[[<collection>/<slug>]]`              → `[<slug>](/<collection>/<slug>)`
 *    - `[[<collection>/<slug>|<display>]]`    → `[<display>](/<collection>/<slug>)`
 *    - Multi-segment paths work too: `[[library/publishers/example-press]]`
 *    - The collection must be in the known set; URL is the wikilink path
 *      verbatim, prefixed with `/`.
 *
 * 2. **Bare-slug** (no slash): falls through to `/topics/<slug>`. The
 *    topic-aggregation page is the natural concept-level destination for an
 *    unqualified reference. Build-time validation against a slug index is a
 *    later phase.
 */

const KNOWN_COLLECTIONS = new Set([
  'docs',
  'wiki',
  'essays',
  'reports',
  'insights',
  'observations',
  'hypotheses',
  'library',
  'glossary',
  'blog',
  'people',
  'tags',
  'topics',
  'contributing',
]);

function isQualified(path: string): boolean {
  if (!path.includes('/')) return false;
  const first = path.split('/')[0];
  return KNOWN_COLLECTIONS.has(first);
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
        return `[${display}](/${linkPath})`;
      }
      // Bare-slug with display: link to topic page
      return `[${display}](/topics/${linkPath})`;
    },
  );

  // 2. Wikilink without display text: [[path]]
  content = content.replace(
    /\[\[([a-z0-9\-/]+)\]\]/g,
    (_match, linkPath) => {
      if (isQualified(linkPath)) {
        const lastSegment = linkPath.split('/').pop();
        return `[${lastSegment}](/${linkPath})`;
      }
      // Bare slug → topic page
      return `[${linkPath}](/topics/${linkPath})`;
    },
  );

  return content;
}

export function processObsidianLinks(content: string): string {
  return withCodeRegionsMasked(content, transformWikilinks);
}
