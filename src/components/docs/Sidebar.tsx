import Link from 'next/link';
import { DocsTree, DocGroup } from '@/lib/content/docs';

interface LinkEntry {
  url: string;
  title: string;
  active: boolean;
}

function LinkList({ entries }: { entries: LinkEntry[] }) {
  if (!entries.length) return null;
  return (
    <ul className="space-y-1 border-l border-gray-200">
      {entries.map(e => (
        <li key={e.url}>
          <Link
            href={e.url}
            aria-current={e.active ? 'page' : undefined}
            className={
              '-ml-px block border-l pl-3 py-1 transition-colors ' +
              (e.active
                ? 'border-indigo-600 text-indigo-700 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300')
            }
          >
            {e.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// The sidebar shows two levels: a group, and — at one level of indent — its
// direct docs together with its sub-collections as sibling links. A sub-
// collection links to its own index page (cards + breadcrumbs carry you
// deeper); the sidebar deliberately does not expand a sub-collection's docs,
// so it never nests past two levels.
function GroupBlock({ group, currentUrl }: { group: DocGroup; currentUrl: string }) {
  const entries: LinkEntry[] = [
    ...group.items.map(it => ({
      url: it.url,
      title: it.title,
      active: it.url === currentUrl,
    })),
    ...group.subgroups.map(sub => ({
      url: sub.url,
      title: sub.title,
      active: currentUrl === sub.url || currentUrl.startsWith(sub.url + '/'),
    })),
  ];
  return (
    <li>
      <Link
        href={group.url}
        className="block font-semibold text-gray-900 uppercase tracking-wide text-xs mb-2 hover:text-indigo-700"
      >
        {group.title}
      </Link>
      <LinkList entries={entries} />
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
