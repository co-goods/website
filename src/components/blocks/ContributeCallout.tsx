import { FaGithub, FaDiscord } from 'react-icons/fa';
import { resolveDiscord } from '@/site.config';

// An "open research — get involved" invitation: edit this page on GitHub and
// join the discussion on Discord. Replaces the thin page-actions row with a
// card that frames these as participation, not chrome.
//
// Dual-use, like every block: registered as the `contribute` block for .md
// composed pages + overlays, and imported directly by the article layouts
// (where it gets a page-specific editUrl + the page's discord value). As a
// block, an author supplies editUrl/discord/heading/body via fence YAML.
//
// `discord` accepts a full URL, a named key (e.g. "invite", "events" — see
// site.config links), or nothing — resolveDiscord always yields a link
// (falling back to the general invite), so the Discord button always shows.
// That's what lets custom pages/overlays, which have no item frontmatter,
// still surface a discussion link.
//
// TODO: migrate to Grund — this is a card pattern once the design system
// covers cards; the participation copy + links stay here.

interface ContributeCalloutProps {
  editUrl?: string;
  discord?: string;
  heading?: string;
  body?: string;
}

export default function ContributeCallout({
  editUrl,
  discord,
  heading,
  body,
}: ContributeCalloutProps) {
  // Dual Discord links: always the server invite (works for anyone), plus the
  // page's specific channel when it differs (member-only — works once you're in).
  const joinHref = resolveDiscord('invite');
  const channelHref = discord ? resolveDiscord(discord) : undefined;
  const showChannel = !!channelHref && channelHref !== joinHref;

  return (
    <aside className="not-prose mt-12 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
      <h2 className="text-base font-semibold text-indigo-900">
        {heading ?? 'This is open research'}
      </h2>
      <p className="mt-1 text-sm text-indigo-700">
        {body ??
          'Co-Goods is developed in the open. Spot something to improve, or want to talk it through?'}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {editUrl && (
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            <FaGithub className="h-4 w-4" aria-hidden="true" />
            Edit this page
          </a>
        )}
        <a
          href={joinHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <FaDiscord className="h-4 w-4" aria-hidden="true" />
          Join our Discord
        </a>
        {showChannel && (
          <a
            href={channelHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            <FaDiscord className="h-4 w-4" aria-hidden="true" />
            Join the conversation
          </a>
        )}
      </div>
    </aside>
  );
}
