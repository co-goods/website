import Link from 'next/link';
import Sidebar from '@/components/docs/Sidebar';
import Breadcrumbs from '@/components/docs/Breadcrumbs';
import { DocsTree, DocCategory } from '@/lib/content/docs';

interface DocsIndexLayoutProps {
  tree: DocsTree;
  // If provided, render only this category. Otherwise render all categories.
  category?: DocCategory;
}

export default function DocsIndexLayout({ tree, category }: DocsIndexLayoutProps) {
  const isRoot = !category;
  const sectionsToShow = isRoot ? tree.categories : [category!];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
        <aside className="lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <Sidebar tree={tree} currentUrl={isRoot ? '/docs' : `/docs/${category!.name}`} />
        </aside>

        <article className="min-w-0">
          <Breadcrumbs
            crumbs={
              isRoot
                ? [{ label: 'Docs' }]
                : [
                    { label: 'Docs', href: '/docs' },
                    { label: category!.name.replace(/-/g, ' ') },
                  ]
            }
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRoot ? 'Docs' : category!.name.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-600 mb-10">
            {isRoot
              ? 'Conventions, schemas, and contributor guides for the Co-Goods research repo.'
              : `Documents in the ${category!.name.replace(/-/g, ' ')} category.`}
          </p>

          <div className="space-y-10">
            {sectionsToShow.map(cat => (
              <section key={cat.name}>
                {isRoot && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 capitalize">
                    {cat.name.replace(/-/g, ' ')}
                  </h2>
                )}
                <ul className="divide-y divide-gray-200 border-t border-gray-200">
                  {cat.pages.map(page => (
                    <li key={page.url} className="py-4">
                      <Link href={page.url} className="group block">
                        <div className="text-base font-medium text-gray-900 group-hover:text-indigo-700">
                          {page.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{page.url}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
