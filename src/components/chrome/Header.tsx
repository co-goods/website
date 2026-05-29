'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/site.config';
import SearchField from './SearchField';

interface NavItem {
  label: string;
  href: string;
}

// Public soft-launch nav — empty until we choose to expose more.
const PUBLIC_NAV: NavItem[] = [];

// Full nav shown when devMode is on (locally + preview deploys).
// Audience-first ordering: Thinking (our voice) → Resources (practical) →
// Research (rigor) → Blog (narrative) → About.
const DEV_NAV: NavItem[] = [
  { label: 'Thinking', href: '/thinking' },
  { label: 'Resources', href: '/resources' },
  { label: 'Research', href: '/research' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

function navItems(): NavItem[] {
  return siteConfig.devMode ? DEV_NAV : PUBLIC_NAV;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const items = navItems();

  // Close menu + search on route change.
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Close whichever panel is open on Escape.
  useEffect(() => {
    if (!open && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, searchOpen]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      <nav aria-label="Primary" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Co-Goods
          </Link>

          <div className="flex items-center gap-x-2 sm:gap-x-4">
            {/* Search toggle — visible at all widths (the search panel slides
                down below the bar). */}
            <button
              type="button"
              aria-label={searchOpen ? 'Close search' : 'Search'}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              className="inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setSearchOpen(v => !v);
                setOpen(false);
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {searchOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </>
                )}
              </svg>
            </button>

            {items.length > 0 && (
              <>
                <ul className="hidden lg:flex items-center gap-x-8">
                  {items.map(item => {
                    const active =
                      pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={
                            active
                              ? 'text-indigo-700 font-medium'
                              : 'text-gray-700 hover:text-gray-900'
                          }
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  aria-expanded={open}
                  aria-controls="mobile-nav"
                  className="lg:hidden inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setOpen(v => !v);
                    setSearchOpen(false);
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {open ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </>
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {searchOpen && (
          <div id="site-search" className="border-t border-gray-200">
            <SearchField onClose={() => setSearchOpen(false)} />
          </div>
        )}

        {items.length > 0 && open && (
          <div id="mobile-nav" className="lg:hidden border-t border-gray-200">
            <ul className="py-3 space-y-1">
              {items.map(item => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        'block px-3 py-2 rounded ' +
                        (active
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100')
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
