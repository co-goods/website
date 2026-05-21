import { TocEntry } from '@/lib/markdown';

interface ArticleLayoutProps {
  collection: string;
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
}

// Minimal placeholder layout used for collections that don't yet have a
// purpose-built layout. Renders the markdown body and shows a small
// banner identifying which collection / route this is, so we can visually
// verify the catch-all routing while later sessions build out the real
// per-collection layouts.
export default function ArticleLayout({
  collection, segments, frontmatter, html,
}: ArticleLayoutProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    collection;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 text-xs text-gray-500 uppercase tracking-wide">
        {collection}
        {segments.length > 0 && ' / ' + segments.join(' / ')}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title as string}</h1>
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
