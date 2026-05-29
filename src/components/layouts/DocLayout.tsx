import Sidebar from '@/components/docs/Sidebar';
import Toc from '@/components/docs/Toc';
import PrevNext from '@/components/docs/PrevNext';
import Breadcrumbs from '@/components/docs/Breadcrumbs';
import { DocsTree, DocItem } from '@/lib/content/docs';
import { TocEntry } from '@/lib/markdown';

// The docs shell: a registry-driven sidebar tree on the left, the page's own
// content in the middle (an article body or an index listing, passed as
// children), and an optional TOC rail on the right. Breadcrumbs + prev/next
// are shown when provided (article pages); index/root pages omit them.
interface DocLayoutProps {
  tree: DocsTree;
  currentUrl: string;
  crumbs?: { label: string; href?: string }[];
  toc?: TocEntry[];
  prev?: DocItem | null;
  next?: DocItem | null;
  children: React.ReactNode;
}

export default function DocLayout({
  tree,
  currentUrl,
  crumbs,
  toc,
  prev,
  next,
  children,
}: DocLayoutProps) {
  const showToc = !!toc && toc.length > 0;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div
        className={
          showToc
            ? 'grid grid-cols-1 lg:grid-cols-[16rem_1fr_14rem] gap-8'
            : 'grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8'
        }
      >
        <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <Sidebar tree={tree} currentUrl={currentUrl} />
        </aside>

        <article className="min-w-0">
          {crumbs && crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}
          {children}
          {(prev || next) && <PrevNext prev={prev ?? null} next={next ?? null} />}
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
