'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/site.config';

interface NavItem {
  label: string;
  href: string;
}

const PUBLIC_NAV: NavItem[] = [
  // Empty in soft-launch mode — public site has only the home page until
  // we choose to expose more. Items added here appear in the public nav.
];

const DEV_NAV: NavItem[] = [
  { label: 'Wiki', href: '/wiki' },
  { label: 'Essays', href: '/essays' },
  { label: 'Insights', href: '/insights' },
  { label: 'Library', href: '/library' },
  { label: 'Glossary', href: '/glossary' },
  { label: 'People', href: '/people' },
  { label: 'Docs', href: '/docs' },
  { label: 'About', href: '/about' },
];

function navItems(): NavItem[] {
  return siteConfig.devMode ? DEV_NAV : PUBLIC_NAV;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navItems();

  // Close mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Close mobile menu on Escape; trap focus is intentionally omitted at v1.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Co-Goods
          </Link>

          {items.length > 0 && (
            <>
              <ul className="hidden lg:flex items-center gap-x-8">
                {items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
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
                onClick={() => setOpen(v => !v)}
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

        {items.length > 0 && open && (
          <div id="mobile-nav" className="lg:hidden border-t border-gray-200">
            <ul className="py-3 space-y-1">
              {items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
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
