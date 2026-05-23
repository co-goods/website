import Link from 'next/link';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { EmailSignup } from '@/components/blocks';

const GITHUB_URL = 'https://github.com/co-goods';
const DISCORD_URL = 'https://discord.gg/8asdWDW5QY';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Project',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Manifesto', href: '/manifesto' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contributing', href: '/contributing' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Wiki', href: '/resources/wiki' },
      { label: 'Glossary', href: '/resources/glossary' },
      { label: 'Library', href: '/library' },
    ],
  },
  {
    heading: 'Research',
    links: [
      { label: 'Insights', href: '/research/insights' },
      { label: 'Sources', href: '/research/sources' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Identity row */}
        <div className="mb-10">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Co-Goods
          </Link>
          <p className="mt-2 text-sm text-gray-600 max-w-md">
            A protocol for co-created and networked physical products that
            become more valuable through shared use and collaborative
            ownership.
          </p>
        </div>

        {/* Column row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {COLUMNS.map(col => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {col.heading}
              </h2>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Community column — signup + social */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Community
            </h2>
            <EmailSignup
              variant="minimal"
              description="Occasional updates. No spam."
              source="footer"
              buttonLabel="Subscribe"
            />
            <div className="mt-4 flex items-center gap-4">
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Co-Goods on GitHub"
              >
                <FaGithub className="w-6 h-6" />
              </Link>
              <Link
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Co-Goods on Discord"
              >
                <FaDiscord className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Legal row */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} Co-Goods. Content licensed CC BY-SA 4.0.</p>
        </div>
      </div>
    </footer>
  );
}
