'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IndexItem } from '@/lib/content/index-data';

type Filter = 'featured' | 'all' | 'cited';

const FILTERS: { key: Filter; label: string; test: (i: IndexItem) => boolean }[] = [
  { key: 'featured', label: 'Featured', test: i => i.isFeatured === true },
  { key: 'all', label: 'All', test: () => true },
  { key: 'cited', label: 'Cited', test: i => i.isCited === true },
];

function isFilter(value: string | null): value is Filter {
  return value === 'featured' || value === 'all' || value === 'cited';
}

interface FilterableIndexProps {
  items: IndexItem[];
  defaultFilter?: Filter;
}

/**
 * Client-side filtered list. Every item is rendered into the DOM regardless of
 * the active filter (so the full set is crawlable and visible without JS); the
 * filter only toggles row visibility. The active filter is mirrored to a
 * `?filter=` query param via the History API for shareable views.
 */
export default function FilterableIndex({ items, defaultFilter = 'featured' }: FilterableIndexProps) {
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  // Seed from the URL on mount, so a shared `?filter=` link opens in that view.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('filter');
    if (isFilter(param)) setFilter(param);
  }, []);

  function select(next: Filter) {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === defaultFilter) url.searchParams.delete('filter');
    else url.searchParams.set('filter', next);
    window.history.replaceState(null, '', url);
  }

  const counts = Object.fromEntries(
    FILTERS.map(f => [f.key, items.filter(f.test).length]),
  ) as Record<Filter, number>;

  const activeTest = FILTERS.find(f => f.key === filter)!.test;
  const visibleCount = items.filter(activeTest).length;

  return (
    <div>
      <div role="group" aria-label="Filter library entries" className="not-prose mb-6 flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => select(f.key)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${active ? 'text-indigo-100' : 'text-gray-400'}`}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {visibleCount === 0 ? (
        <p className="text-sm text-gray-500 italic">No entries match this filter yet.</p>
      ) : null}

      <ul className="divide-y divide-gray-200 border-t border-gray-200">
        {items.map(item => (
          <li key={item.url} hidden={!activeTest(item)} className="py-4">
            <Link href={item.url} className="group block">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 text-lg font-medium text-gray-900 group-hover:text-indigo-700">
                  {item.title}
                </span>
                <div className="not-prose flex shrink-0 flex-wrap justify-end gap-2 pt-1">
                  {item.typeLabel && (
                    <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                      {item.typeLabel}
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}
                  {item.isCited && (
                    <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                      Cited
                    </span>
                  )}
                </div>
              </div>
              {(item.authors?.length || item.venue || item.published) && (
                <div className="mt-0.5 text-sm text-gray-500">
                  {[item.authors?.join(', '), item.venue, item.published]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
              {item.summary && (
                <div className="mt-1 text-sm text-gray-600">{item.summary}</div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
