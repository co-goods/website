import Sidebar from '@/components/docs/Sidebar';
import Toc from '@/components/docs/Toc';
import PrevNext from '@/components/docs/PrevNext';
import Breadcrumbs from '@/components/docs/Breadcrumbs';
import { DocsTree, DocPage } from '@/lib/content/docs';
import { TocEntry } from '@/lib/markdown';

interface DocLayoutProps {
  tree: DocsTree;
  current: DocPage;
  prev: DocPage | null;
  next: DocPage | null;
  html: string;
  toc: TocEntry[];
}

export default function DocLayout({
  tree, current, prev, next, html, toc,
}: DocLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr_14rem] gap-8">
        <aside className="lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <Sidebar tree={tree} currentUrl={current.url} />
        </aside>

        <article className="min-w-0">
          <Breadcrumbs
            crumbs={[
              { label: 'Docs', href: '/docs' },
              { label: current.category.replace(/-/g, ' '), href: `/docs/${current.category}` },
              { label: current.title },
            ]}
          />
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <PrevNext prev={prev} next={next} />
        </article>

        <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <Toc entries={toc} />
        </aside>
      </div>
    </div>
  );
}
