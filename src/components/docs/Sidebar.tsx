import Link from 'next/link';
import { DocsTree } from '@/lib/content/docs';

interface SidebarProps {
  tree: DocsTree;
  currentUrl: string;
}

export default function Sidebar({ tree, currentUrl }: SidebarProps) {
  return (
    <nav aria-label="Documentation" className="text-sm">
      <ul className="space-y-6">
        {tree.categories.map(category => (
          <li key={category.name}>
            <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-xs mb-2">
              {category.name.replace(/-/g, ' ')}
            </h3>
            <ul className="space-y-1 border-l border-gray-200">
              {category.pages.map(page => {
                const isActive = page.url === currentUrl;
                return (
                  <li key={page.url}>
                    <Link
                      href={page.url}
                      className={
                        '-ml-px block border-l pl-3 py-1 transition-colors ' +
                        (isActive
                          ? 'border-indigo-600 text-indigo-700 font-medium'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300')
                      }
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
