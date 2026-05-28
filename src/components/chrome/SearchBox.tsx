'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import MiniSearch from 'minisearch';

// Placeholder search: a header field that lazy-loads the static search index
// on first focus, builds a MiniSearch index in the browser, and shows matches
// in a dropdown. No server, no per-query cost. Styling is deliberately minimal
// — this is a functional placeholder until the search UI gets a design pass.

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

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const miniRef = useRef<MiniSearch<SearchDoc> | null>(null);
  const loadingRef = useRef(false);

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
    <div className="relative">
      <input
        type="search"
        value={query}
        placeholder="Search…"
        aria-label="Search the site"
        onFocus={() => {
          ensureIndex();
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => onChange(e.target.value)}
        className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:w-56 focus:border-gray-400 focus:outline-none transition-[width]"
      />
      {open && query.trim() && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg z-50">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No results</p>
          ) : (
            <ul className="py-1">
              {results.map(r => (
                <li key={r.url}>
                  <Link
                    href={r.url}
                    className="block px-4 py-2 hover:bg-gray-50"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}
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
