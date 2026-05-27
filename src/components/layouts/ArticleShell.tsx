import Toc from '@/components/docs/Toc';
import { TocEntry } from '@/lib/markdown';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import type { OverlaySlots } from '@/lib/overlays';

// Two-column shell: main column for header + body, optional right rail for TOC.
// All per-collection layouts compose this.
//
// When an `overlay` is present (a splice file parallel to the source content),
// its sections render around the default content by region: `top`/`bottom` are
// full-width zones above/below the article; `bodyBefore`/`bodyAfter` bracket the
// page's own body; `sidebar` sits under the TOC. Absent overlay = no-op.
export default function ArticleShell({
  collection,
  segments,
  header,
  children,
  toc,
  overlay,
}: {
  collection: string;
  segments: string[];
  header: React.ReactNode;
  children: React.ReactNode;
  toc?: TocEntry[];
  overlay?: OverlaySlots | null;
}) {
  const showToc = toc && toc.length > 0;
  const showSidebarOverlay = overlay && overlay.sidebar.length > 0;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {overlay && overlay.top.length > 0 && <BlockRenderer blocks={overlay.top} />}
      <div className={
        showToc || showSidebarOverlay
          ? 'grid grid-cols-1 lg:grid-cols-[1fr_14rem] gap-12'
          : 'mx-auto max-w-3xl'
      }>
        <article className="min-w-0">
          <div className="mb-2 text-xs text-gray-500 uppercase tracking-wide">
            {collection}
            {segments.length > 1 && ' / ' + segments.slice(0, -1).join(' / ')}
          </div>
          {header}
          {overlay && overlay.bodyBefore.length > 0 && <BlockRenderer blocks={overlay.bodyBefore} />}
          {children}
          {overlay && overlay.bodyAfter.length > 0 && <BlockRenderer blocks={overlay.bodyAfter} />}
        </article>
        {(showToc || showSidebarOverlay) && (
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            {showToc && <Toc entries={toc} />}
            {showSidebarOverlay && <BlockRenderer blocks={overlay!.sidebar} />}
          </aside>
        )}
      </div>
      {overlay && overlay.bottom.length > 0 && <BlockRenderer blocks={overlay.bottom} />}
    </div>
  );
}
