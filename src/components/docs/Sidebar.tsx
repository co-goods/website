import Link from 'next/link';
import { DocsTree, DocGroup, DocItem } from '@/lib/content/docs';

function ItemLinks({ items, currentUrl }: { items: DocItem[]; currentUrl: string }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-1 border-l border-gray-200">
      {items.map(item => {
        const isActive = item.url === currentUrl;
        return (
          <li key={item.url}>
            <Link
              href={item.url}
              aria-current={isActive ? 'page' : undefined}
              className={
                '-ml-px block border-l pl-3 py-1 transition-colors ' +
                (isActive
                  ? 'border-indigo-600 text-indigo-700 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300')
              }
            >
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function GroupBlock({ group, currentUrl }: { group: DocGroup; currentUrl: string }) {
  return (
    <li>
      <Link
        href={group.url}
        className="block font-semibold text-gray-900 uppercase tracking-wide text-xs mb-2 hover:text-indigo-700"
      >
        {group.title}
      </Link>
      <ItemLinks items={group.items} currentUrl={currentUrl} />
      {group.subgroups.length > 0 && (
        <ul className="mt-3 space-y-3 pl-3">
          {group.subgroups.map(sub => (
            <li key={sub.name}>
              <Link
                href={sub.url}
                className="block font-medium text-gray-700 text-xs mb-1 hover:text-indigo-700"
              >
                {sub.title}
              </Link>
              <ItemLinks items={sub.items} currentUrl={currentUrl} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({ tree, currentUrl }: { tree: DocsTree; currentUrl: string }) {
  return (
    <nav aria-label="Documentation" className="text-sm">
      <ul className="space-y-6">
        {tree.groups.map(group => (
          <GroupBlock key={group.name} group={group} currentUrl={currentUrl} />
        ))}
      </ul>
    </nav>
  );
}
