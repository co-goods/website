import fs from 'fs';
import matter from 'gray-matter';
import { enumerateAllParams } from '@/lib/content/enumerate';
import { resolveUrl } from '@/lib/content/resolver';

// Build-time search index. A force-static route handler: Next prerenders it to
// a flat /search-index.json at build, so search costs nothing at runtime — the
// client fetches this once and queries it in the browser (see SearchBox).
//
// We index every page backed by a single source file (collection items +
// plain-page standalones), reusing the same URL enumeration the catch-all
// route uses. Derived/index/umbrella pages are skipped (no single source).
export const dynamic = 'force-static';

interface SearchDoc {
  id: string;
  url: string;
  title: string;
  collection?: string;
  summary?: string;
  tags?: string[];
  text: string;
}

// Strip markdown/wikilink/fence noise to plain-ish text for indexing.
function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function GET() {
  const docs: SearchDoc[] = [];

  for (const { slug } of enumerateAllParams()) {
    const resolved = resolveUrl(slug);
    if (!resolved) continue;
    if (resolved.kind !== 'page' && resolved.kind !== 'standalone') continue;

    const url = '/' + slug.join('/');
    try {
      const { data, content } = matter(fs.readFileSync(resolved.filepath, 'utf8'));
      const title =
        (typeof data.title === 'string' && data.title.trim()) ||
        (typeof data.name === 'string' && data.name.trim()) ||
        content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
        slug[slug.length - 1];
      const tags = Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === 'string')
        : undefined;

      docs.push({
        id: url,
        url,
        title: String(title),
        collection: resolved.kind === 'page' ? resolved.collection.name : undefined,
        summary: typeof data.summary === 'string' ? data.summary : undefined,
        tags,
        text: plainText(content).slice(0, 2000),
      });
    } catch {
      // Skip anything unreadable rather than failing the whole index.
    }
  }

  return Response.json(docs);
}
