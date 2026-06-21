import Link from 'next/link';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { resolveDiscord, resolveGithub } from '@/site.config';

type CTAVariant = 'primary' | 'secondary';

// Discord/GitHub CTAs carry the platform logo, matched on the href scheme.
function schemeIcon(href: string) {
  if (href.startsWith('discord:')) return <FaDiscord className="h-4 w-4" aria-hidden="true" />;
  if (href.startsWith('github:')) return <FaGithub className="h-4 w-4" aria-hidden="true" />;
  return null;
}

// An href of `discord:<key>` or `github:<key>` (e.g. `discord:invite`,
// `discord:research`, `github:org`) resolves to the configured URL — sourced
// from env vars, never hardcoded — so links live in one place. Other hrefs
// pass through.
function resolveHref(href: string): string {
  if (href.startsWith('discord:')) return resolveDiscord(href.slice('discord:'.length));
  if (href.startsWith('github:')) return resolveGithub(href.slice('github:'.length));
  return href;
}

interface CTAProps {
  label: string;
  href: string;
  variant?: CTAVariant;
  description?: string;
  heading?: string;
}

const VARIANT_STYLES: Record<CTAVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
};

export default function CTA({
  label,
  href,
  variant = 'primary',
  description,
  heading,
}: CTAProps) {
  // A bare button (no heading/description) is a section affordance — keep it
  // tight to whatever it follows. A full CTA (with heading/description) gets
  // roomy standalone spacing.
  const compact = !heading && !description;
  return (
    <section className={`px-4 sm:px-6 lg:px-8 ${compact ? 'py-3' : 'py-10'}`}>
      <div className="mx-auto max-w-3xl text-center">
        {heading && (
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {heading}
          </h2>
        )}
        {description && (
          <p className="mt-3 text-base text-gray-600">{description}</p>
        )}
        <div className={compact ? '' : 'mt-6'}>
          <Link
            href={resolveHref(href)}
            className={`inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold ${VARIANT_STYLES[variant]}`}
          >
            {schemeIcon(href)}
            {label}
          </Link>
        </div>
      </div>
    </section>
  );
}
