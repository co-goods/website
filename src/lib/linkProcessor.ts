/**
 * Converts Obsidian wikilinks to website-compatible markdown links.
 *
 * Supports two syntaxes:
 *
 * 1. **Qualified-path** (the current Co-Goods convention):
 *    - `[[<collection>/<slug>]]`              → `[<slug>](/<collection>/<slug>)`
 *    - `[[<collection>/<slug>|<display>]]`    → `[<display>](/<collection>/<slug>)`
 *    - Multi-segment paths work too: `[[library/publishers/example-press]]`
 *    - The collection must be in the known set; URL is the wikilink path
 *      verbatim, prefixed with `/`.
 *
 * 2. **Bare-slug** (legacy heuristic, pre-architecture-review). Kept for
 *    backward compatibility with content that pre-dates the qualified-path
 *    convention. Will be retired once content is migrated and the global
 *    slug index lands (Phase 4 / topic-aggregation work).
 */

// Collection names recognised by qualified-path syntax. Multi-segment paths
// just need the first segment to be in this set; the rest is passed through.
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
  // 1. Qualified-path with display text: [[collection/slug|Display]]
  content = content.replace(
    /\[\[([a-z0-9\-/]+)\|([^\]]+)\]\]/g,
    (match, linkPath, display) => {
      if (isQualified(linkPath)) {
        return `[${display}](/${linkPath})`;
      }
      return match;
    },
  );

  // 2. Qualified-path without display text: [[collection/slug]]
  content = content.replace(
    /\[\[([a-z0-9\-/]+)\]\]/g,
    (match, linkPath) => {
      if (isQualified(linkPath)) {
        const lastSegment = linkPath.split('/').pop();
        return `[${lastSegment}](/${linkPath})`;
      }
      return match;
    },
  );

  // 3. Legacy bare-slug heuristics. The regex matches only bare slugs (no
  //    slash). Maps to the old route shape — kept for content that pre-dates
  //    the qualified-path convention.
  content = content.replace(/\[\[([a-z0-9-]+)\]\]/g, (match, slug) => {
    if (isTag(slug)) {
      return `[${slug}](/resources/tags/${slug})`;
    } else if (isAuthor(slug)) {
      return `[${slug}](/resources/authors/${slug})`;
    } else if (isSource(slug)) {
      return `[${slug}](/resources/sources/${slug})`;
    } else if (isInsight(slug)) {
      return `[${slug}](/resources/insights/${slug})`;
    } else if (isContributor(slug)) {
      return `[${slug}](/contributors/${slug})`;
    }

    return `[${slug}](/resources/tags/${slug})`;
  });

  content = content.replace(/\[\[([^|]+)\|([a-z0-9-]+)\]\]/g, (match, displayName, slug) => {
    if (isTag(slug)) {
      return `[${displayName}](/resources/tags/${slug})`;
    } else if (isAuthor(slug)) {
      return `[${displayName}](/resources/authors/${slug})`;
    }
    return `[${displayName}](/resources/tags/${slug})`;
  });

  return content;
}

export function processObsidianLinks(content: string): string {
  return withCodeRegionsMasked(content, transformWikilinks);
}

// Legacy heuristics for bare-slug fallback. Will be replaced by the
// build-time global slug index in a later phase.
function isTag(slug: string): boolean {
  return !slug.includes('-2') && !slug.includes('f-') && !slug.includes('-analysis');
}

function isAuthor(slug: string): boolean {
  return slug === 'f-xavier-olleros' || (slug.includes('-') && /^[a-z]+-[a-z]+(-[a-z]+)?$/.test(slug));
}

function isSource(slug: string): boolean {
  return slug.includes('-20') || slug.includes('-paper-') || slug.includes('-study-');
}

function isInsight(slug: string): boolean {
  return slug.includes('-analysis') || slug.includes('-patterns') || slug.includes('-insights');
}

function isContributor(slug: string): boolean {
  return slug === 'pontus-karlsson' || slug.includes('-contributor');
}

export function processObsidianLinksWithLookup(
  content: string,
  contentRegistry: { [slug: string]: string },
): string {
  return content.replace(/\[\[([a-z0-9-]+)\]\]/g, (match, slug) => {
    const contentType = contentRegistry[slug];
    if (contentType) {
      return `[${slug}](/${contentType}/${slug})`;
    }
    return match;
  });
}
