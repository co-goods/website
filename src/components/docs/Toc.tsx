'use client';

import { useEffect, useRef, useState } from 'react';
import { TocEntry } from '@/lib/markdown';

interface TocProps {
  entries: TocEntry[];
}

export default function Toc({ entries }: TocProps) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!entries.length) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      observed => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Pick the entry that's furthest up the document order among visible.
        const firstVisible = entries.find(e => visible.has(e.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { rootMargin: '0px 0px -75% 0px', threshold: 0 },
    );

    for (const e of entries) {
      const el = document.getElementById(e.id);
      if (el) observer.observe(el);
    }
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-xs mb-3">
        On this page
      </h4>
      <ul className="space-y-1 border-l border-gray-200">
        {entries.map(entry => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id} style={{ paddingLeft: (entry.level - 2) * 12 }}>
              <a
                href={`#${entry.id}`}
                className={
                  '-ml-px block border-l pl-3 py-0.5 transition-colors ' +
                  (isActive
                    ? 'border-indigo-600 text-indigo-700 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300')
                }
              >
                {entry.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
