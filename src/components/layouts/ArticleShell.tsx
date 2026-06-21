import Toc from '@/components/docs/Toc';
import { TocEntry } from '@/lib/markdown';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import type { OverlaySlots } from '@/lib/overlays';
import ContributeCallout from '@/components/sections/ContributeCallout';
import { Breadcrumb } from './atoms';

// Two-column shell: main column for header + body, optional right rail for TOC.
// All per-collection layouts compose this.
//
// When an `overlay` is present (a splice file parallel to the source content),
// its sections render around the default content by region: `top`/`bottom` are
// full-width zones above/below the article; `bodyBefore`/`bodyAfter` bracket the
// page's own body; `sidebar` sits under the TOC. Absent overlay = no-op.
export default function ArticleShell({
  segments,
  header,
  children,
  toc,
  overlay,
  editUrl,
  discord,
}: {
  collection: string;
  segments: string[];
  header: React.ReactNode;
  children: React.ReactNode;
  toc?: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}) {
  const showToc = toc && toc.length > 0;
  const showSidebarOverlay = overlay && overlay.sidebar.length > 0;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {overlay && overlay.top.length > 0 && <SectionRenderer sections={overlay.top} />}
      <div className={
        showToc || showSidebarOverlay
          ? 'grid grid-cols-1 lg:grid-cols-[1fr_14rem] gap-12'
          : 'mx-auto max-w-3xl'
      }>
        <article className="min-w-0">
          <Breadcrumb segments={segments} />
          {header}
          {overlay && overlay.bodyBefore.length > 0 && <SectionRenderer sections={overlay.bodyBefore} />}
          {children}
          {overlay && overlay.bodyAfter.length > 0 && <SectionRenderer sections={overlay.bodyAfter} />}
          <ContributeCallout editUrl={editUrl} discord={discord} />
        </article>
        {(showToc || showSidebarOverlay) && (
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            {showToc && <Toc entries={toc} />}
            {showSidebarOverlay && <SectionRenderer sections={overlay!.sidebar} />}
          </aside>
        )}
      </div>
      {overlay && overlay.bottom.length > 0 && <SectionRenderer sections={overlay.bottom} />}
    </div>
  );
}
