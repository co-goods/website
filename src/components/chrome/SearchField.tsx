'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MiniSearch from 'minisearch';

// The search field + results, rendered inside the header's slide-down search
// panel (opened by the magnifying-glass toggle). Lazy-loads the static index
// on mount, builds a MiniSearch index in the browser, queries as you type.
// No server, no per-query cost. Placeholder styling pending the design pass.

interface SearchDoc {
  id: string;
  url: string;
  title: string;
  collection?: string;
  summary?: string;
  tags?: string[];
  text: string;
}

type Hit = Pick<SearchDoc, 'url' | 'title' | 'collection' | 'summary'>;

export default function SearchField({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hit[]>([]);
  const miniRef = useRef<MiniSearch<SearchDoc> | null>(null);
  const loadingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ensureIndex = useCallback(async () => {
    if (miniRef.current || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch('/search-index.json');
      const docs: SearchDoc[] = await res.json();
      const mini = new MiniSearch<SearchDoc>({
        fields: ['title', 'summary', 'tags', 'text'],
        storeFields: ['url', 'title', 'collection', 'summary'],
        searchOptions: { boost: { title: 3, tags: 2 }, prefix: true, fuzzy: 0.2 },
      });
      mini.addAll(docs.map(d => ({ ...d, tags: (d.tags ?? []).join(' ') } as unknown as SearchDoc)));
      miniRef.current = mini;
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // Focus the input and warm the index as soon as the panel opens.
  useEffect(() => {
    inputRef.current?.focus();
    ensureIndex();
  }, [ensureIndex]);

  const onChange = useCallback(
    async (value: string) => {
      setQuery(value);
      await ensureIndex();
      const trimmed = value.trim();
      if (!trimmed || !miniRef.current) {
        setResults([]);
        return;
      }
      setResults(miniRef.current.search(trimmed).slice(0, 8) as unknown as Hit[]);
    },
    [ensureIndex],
  );

  return (
    <div className="py-4">
      <div className="flex items-center gap-3 border-b border-gray-300 pb-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 shrink-0"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search the site…"
          aria-label="Search the site"
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {query.trim() && (
        <div className="mt-3 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">No results</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map(r => (
                <li key={r.url}>
                  <Link
                    href={r.url}
                    className="block py-2 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    <span className="block text-sm font-medium text-gray-900">{r.title}</span>
                    {r.collection && (
                      <span className="block text-xs uppercase tracking-wide text-gray-400">
                        {r.collection}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
