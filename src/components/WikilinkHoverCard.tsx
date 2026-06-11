'use client';

// Hover-preview cards for internal links inside article/doc prose.
//
// The body is rendered to an HTML string (dangerouslySetInnerHTML), so there's
// no React link component to override — instead we enhance the rendered links
// on the client: find internal links inside `.prose`, look each up in the
// prebuilt search index (/search-index.json), and show a small preview card on
// hover/focus. Read-only preview only; related-items / deeper drill-in is a
// later iteration.
//
// TODO: migrate to Grund — this is a hover-card / popover Pattern candidate.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

interface Doc {
  url: string;
  title: string;
  summary?: string;
  collection?: string;
  text?: string;
}

// Fetch + index once, cached across navigations.
let indexPromise: Promise<Map<string, Doc>> | null = null;
function loadIndex(): Promise<Map<string, Doc>> {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then(r => (r.ok ? r.json() : []))
      .then((docs: Doc[]) => new Map(docs.map(d => [d.url, d])))
      .catch(() => new Map<string, Doc>());
  }
  return indexPromise;
}

interface CardState {
  doc: Doc;
  x: number;
  y: number;
}

export default function WikilinkHoverCard() {
  const pathname = usePathname();
  const [card, setCard] = useState<CardState | null>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const overCard = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    loadIndex().then(index => {
      if (cancelled) return;
      // Let the route's DOM settle before querying.
      const tid = window.setTimeout(() => {
        // Body prose links, plus any container opted in with `data-hovercard`
        // (related terms, tag pills, concept facets, listing rows).
        const links = document.querySelectorAll<HTMLAnchorElement>(
          '.prose a[href^="/"], [data-hovercard] a[href^="/"]',
        );
        links.forEach(link => {
          const raw = link.getAttribute('href');
          if (!raw) return;
          const href = raw.split('#')[0].split('?')[0];
          const doc = index.get(href);
          if (!doc) return;

          const show = () => {
            if (hideTimer.current) window.clearTimeout(hideTimer.current);
            showTimer.current = window.setTimeout(() => {
              const r = link.getBoundingClientRect();
              setCard({ doc, x: r.left, y: r.bottom });
            }, 120);
          };
          const hide = () => {
            if (showTimer.current) window.clearTimeout(showTimer.current);
            hideTimer.current = window.setTimeout(() => {
              if (!overCard.current) setCard(null);
            }, 150);
          };

          link.addEventListener('mouseenter', show);
          link.addEventListener('mouseleave', hide);
          link.addEventListener('focus', show);
          link.addEventListener('blur', hide);
          cleanups.push(() => {
            link.removeEventListener('mouseenter', show);
            link.removeEventListener('mouseleave', hide);
            link.removeEventListener('focus', show);
            link.removeEventListener('blur', hide);
          });
        });
      }, 50);
      cleanups.push(() => window.clearTimeout(tid));
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCard(null);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      cancelled = true;
      cleanups.forEach(c => c());
      document.removeEventListener('keydown', onKey);
      if (showTimer.current) window.clearTimeout(showTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  if (!card) return null;

  const raw = (card.doc.summary && card.doc.summary.trim()) || (card.doc.text || '').trim();
  const preview = raw.length > 180 ? raw.slice(0, 180).trimEnd() + '…' : raw;
  const left = Math.max(8, Math.min(card.x, (typeof window !== 'undefined' ? window.innerWidth : 1024) - 332));

  return createPortal(
    <div
      role="tooltip"
      onMouseEnter={() => {
        overCard.current = true;
      }}
      onMouseLeave={() => {
        overCard.current = false;
        setCard(null);
      }}
      style={{ position: 'fixed', left, top: card.y + 8, zIndex: 60, maxWidth: 320 }}
      className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
    >
      {card.doc.collection && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {card.doc.collection}
        </div>
      )}
      <div className="text-sm font-semibold text-gray-900">{card.doc.title}</div>
      {preview && <p className="mt-1 line-clamp-3 text-sm text-gray-600">{preview}</p>}
    </div>,
    document.body,
  );
}
