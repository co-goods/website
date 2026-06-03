import { resolveLicense } from '@/lib/licenses';

interface LicenseBadgeProps {
  /** SPDX identifier, e.g. "CC-BY-SA-4.0". */
  spdx: unknown;
  /** Optional override URL (rarely needed; the SPDX id resolves one). */
  url?: string;
  /** Small inline label prefix, e.g. "Licensed". */
  label?: string;
}

// Renders an SPDX identifier as a friendly, linked badge. Shared by the
// frontmatter license badge and the `license` block. Renders nothing for an
// unresolvable id.
export default function LicenseBadge({ spdx, url, label }: LicenseBadgeProps) {
  const resolved = resolveLicense(spdx);
  if (!resolved) return null;
  const href = (typeof url === 'string' && url) || resolved.url;
  return (
    <span className="not-prose inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
      {label && <span className="text-gray-500">{label}</span>}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer license"
        className="text-gray-700 hover:text-indigo-700 hover:underline"
      >
        {resolved.label}
      </a>
    </span>
  );
}
