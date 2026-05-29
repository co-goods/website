import Link from 'next/link';
import { FaGithub, FaDiscord, FaLinkedin } from 'react-icons/fa';
import { EmailSignup } from '@/components/blocks';
import { siteConfig } from '@/site.config';

const GITHUB_URL = siteConfig.links.github.org;
const DISCORD_URL = siteConfig.links.discord.invite;
const LINKEDIN_URL = 'https://linkedin.com/company/co-goods';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const INITIATIVE: FooterColumn = {
  heading: 'Initiative',
  links: [
    { label: 'About', href: '/about' },
    { label: 'Manifesto', href: '/thinking/manifesto' },
    { label: 'Blog', href: '/blog' },
  ],
};

const CONTRIBUTE: FooterColumn = {
  heading: 'Contribute',
  links: [
    { label: 'Contributing', href: '/contributing' },
    { label: 'Docs', href: '/docs' },
    { label: 'Code & content on GitHub', href: GITHUB_URL, external: true },
    { label: 'Chat on Discord', href: DISCORD_URL, external: true },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-lg font-bold text-gray-900">
              Co-Goods
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              A protocol for co-created and networked physical products that
              become more valuable through shared use and collaborative
              ownership.
            </p>
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
              <Link
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Co-Goods on LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {[INITIATIVE, CONTRIBUTE].map(col => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {col.heading}
              </h2>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      {...(l.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Connect
            </h2>
            <EmailSignup
              variant="minimal"
              description="Occasional updates. No spam."
              source="footer"
              buttonLabel="Subscribe"
            />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <p>© {year} DePalma Workwear Limited and contributors</p>
          <p>Content licensed CC BY-SA 4.0 unless otherwise noted</p>
        </div>
      </div>
    </footer>
  );
}
