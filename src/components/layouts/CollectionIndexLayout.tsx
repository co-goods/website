import Link from 'next/link';
import { IndexData, IndexItem } from '@/lib/content/index-data';
import { Breadcrumb } from './atoms';

interface CollectionIndexLayoutProps {
  data: IndexData;
  // Full URL path segments (e.g. ['tags', 'network-effects']) — drives the breadcrumb.
  segments: string[];
  collectionName?: string;
  // When true, items are grouped under their `typeLabel` (e.g. "Wiki",
  // "Paper") — used on concept hubs (tags / topics) so the kinds of content
  // referencing a concept are visible at a glance.
  groupByType?: boolean;
}

// Display order for grouped sections; unknown labels fall to the end.
const GROUP_ORDER = [
  'Glossary',
  'Wiki', 'Essay', 'Insight', 'Observation', 'Hypothesis', 'Report',
  'Book', 'Paper', 'Article', 'Standard', 'Publisher', 'Publication',
  'Person', 'Organization', 'Blog post',
];

function ItemRow({ item, showType }: { item: IndexItem; showType?: boolean }) {
  return (
    <li className="py-4">
      <Link href={item.url} className="group block">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-medium text-gray-900 group-hover:text-indigo-700">{item.title}</span>
          {showType && item.typeLabel && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              {item.typeLabel}
            </span>
          )}
        </div>
        {item.summary && (
          <div className="text-sm text-gray-600 mt-1">{item.summary}</div>
        )}
      </Link>
    </li>
  );
}

function groupItems(items: IndexItem[]): { label: string; items: IndexItem[] }[] {
  const by = new Map<string, IndexItem[]>();
  for (const it of items) {
    const label = it.typeLabel || 'Other';
    (by.get(label) ?? by.set(label, []).get(label)!).push(it);
  }
  return [...by.keys()]
    .sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a), ib = GROUP_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    })
    .map(label => ({ label, items: by.get(label)! }));
}

// Pluralise a singular type label for a group heading ("Wiki" → "Wiki", "Paper" → "Papers").
function headingFor(label: string, count: number): string {
  if (count === 1) return label;
  if (label === 'Wiki') return 'Wiki';
  return label.endsWith('s') ? label : `${label}s`;
}

export default function CollectionIndexLayout({
  data, segments, groupByType,
}: CollectionIndexLayoutProps) {
  const groups = groupByType ? groupItems(data.items) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb segments={segments} />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.title}</h1>
      <div className="mb-8">
        {data.description && <p className="text-gray-600">{data.description}</p>}
        {data.anchor && (
          <Link href={data.anchor.url} className="mt-1 inline-block text-sm text-indigo-700 hover:underline">
            {data.anchor.label} →
          </Link>
        )}
      </div>

      {data.items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No items yet.</p>
      ) : groups ? (
        <div className="space-y-8">
          {groups.map(g => (
            <section key={g.label}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                {headingFor(g.label, g.items.length)}
              </h2>
              <ul className="divide-y divide-gray-200 border-t border-gray-200" data-hovercard>
                {g.items.map(item => <ItemRow key={item.url} item={item} />)}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 border-t border-gray-200" data-hovercard>
          {data.items.map(item => <ItemRow key={item.url} item={item} showType />)}
        </ul>
      )}
    </div>
  );
}
