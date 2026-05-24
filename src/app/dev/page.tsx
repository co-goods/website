import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Internal nav',
  robots: { index: false, follow: false },
};

interface NavGroup {
  heading: string;
  description?: string;
  links: { label: string; href: string; description?: string }[];
}

const groups: NavGroup[] = [
  {
    heading: 'Content collections',
    description:
      'Per-collection index pages and example items. Reachable here regardless of public-route gating.',
    links: [
      { label: 'Wiki', href: '/wiki' },
      { label: 'Essays', href: '/essays' },
      { label: 'Insights', href: '/insights' },
      { label: 'Observations', href: '/observations' },
      { label: 'Hypotheses', href: '/hypotheses' },
      { label: 'Library', href: '/library' },
      { label: 'Library — publishers', href: '/library/publishers' },
      { label: 'Library — publications', href: '/library/publications' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'People', href: '/people' },
      { label: 'Tags', href: '/tags' },
      { label: 'Blog', href: '/blog' },
      { label: 'Reports', href: '/reports' },
      { label: 'Topics', href: '/topics' },
    ],
  },
  {
    heading: 'Docs',
    links: [
      { label: 'Docs root', href: '/docs' },
      { label: 'Conventions', href: '/docs/conventions' },
      { label: 'Schemas', href: '/docs/schemas' },
      { label: 'Contributing (docs)', href: '/docs/contributing' },
    ],
  },
  {
    heading: 'Site pages',
    links: [
      { label: 'Home (/)', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Contributing (/contributing)', href: '/contributing' },
    ],
  },
];

export default function DevPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
          Internal
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Developer nav</h1>
        <p className="mt-2 text-gray-600">
          Click-around index for development. This page is noindex,nofollow
          and excluded from the sitemap. Items here may or may not currently
          be reachable depending on <code>site.config.ts</code> route gating.
        </p>
      </div>

      <div className="space-y-10">
        {groups.map(group => (
          <section key={group.heading}>
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
              {group.heading}
            </h2>
            {group.description && (
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              {group.links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-indigo-700 hover:underline"
                  >
                    {link.label}
                  </Link>
                  <span className="ml-2 text-xs text-gray-400 font-mono">
                    {link.href}
                  </span>
                  {link.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {link.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
