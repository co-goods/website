import Toc from '@/components/docs/Toc';
import { TocEntry } from '@/lib/markdown';

// Two-column shell: main column for header + body, optional right rail for TOC.
// All per-collection layouts compose this.
export default function ArticleShell({
  collection,
  segments,
  header,
  children,
  toc,
}: {
  collection: string;
  segments: string[];
  header: React.ReactNode;
  children: React.ReactNode;
  toc?: TocEntry[];
}) {
  const showToc = toc && toc.length > 0;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className={
        showToc
          ? 'grid grid-cols-1 lg:grid-cols-[1fr_14rem] gap-12'
          : 'mx-auto max-w-3xl'
      }>
        <article className="min-w-0">
          <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide">
            {collection}
            {segments.length > 1 && ' / ' + segments.slice(0, -1).join(' / ')}
          </div>
          {header}
          {children}
        </article>
        {showToc && (
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <Toc entries={toc} />
          </aside>
        )}
      </div>
    </div>
  );
}
