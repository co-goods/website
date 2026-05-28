import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import { CollectionRefList, ExampleBanner, TagList } from './atoms';

interface PersonProfileProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discordUrl?: string;
}

type Affiliation = 'co-goods-team' | 'depalma-pilot' | 'external-author' | 'unclaimed';

const AFFILIATION_LABELS: Record<Affiliation, string> = {
  'co-goods-team': 'Co-Goods Team',
  'depalma-pilot': 'DePalma Pilot',
  'external-author': 'External',
  'unclaimed': 'Unclaimed',
};

const AFFILIATION_STYLES: Record<Affiliation, string> = {
  'co-goods-team': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'depalma-pilot': 'bg-violet-50 text-violet-700 border-violet-200',
  'external-author': 'bg-gray-100 text-gray-700 border-gray-300',
  'unclaimed': 'bg-gray-50 text-gray-500 border-gray-200',
};

function AffiliationBadge({ value }: { value: string }) {
  const key = (value in AFFILIATION_LABELS ? value : 'unclaimed') as Affiliation;
  return (
    <span className={`not-prose inline-block rounded border px-2 py-0.5 text-xs font-medium ${AFFILIATION_STYLES[key]}`}>
      {AFFILIATION_LABELS[key]}
    </span>
  );
}

function ContactLinks({ frontmatter }: { frontmatter: Record<string, unknown> }) {
  const items: { label: string; href: string }[] = [];
  const website = typeof frontmatter.website === 'string' ? frontmatter.website : null;
  const github = typeof frontmatter.github === 'string' ? frontmatter.github : null;
  const orcid = typeof frontmatter.orcid === 'string' ? frontmatter.orcid : null;
  const email = typeof frontmatter.email === 'string' ? frontmatter.email : null;

  if (website) items.push({ label: 'Website', href: website });
  if (github) items.push({ label: 'GitHub', href: github.startsWith('http') ? github : `https://github.com/${github}` });
  if (orcid && /^[0-9-]+$/.test(orcid)) items.push({ label: 'ORCID', href: `https://orcid.org/${orcid}` });
  if (email) items.push({ label: 'Email', href: `mailto:${email}` });

  if (!items.length) return null;
  return (
    <div className="not-prose my-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-gray-500">Contact</span>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map((i) => (
          <li key={i.label}>
            <a
              href={i.href}
              className="text-indigo-700 hover:underline"
              target={i.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={i.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PersonProfile({ segments, frontmatter, html, toc, overlay, editUrl, discordUrl }: PersonProfileProps) {
  const name =
    (typeof frontmatter.name === 'string' && frontmatter.name) ||
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Person';

  const affiliation = typeof frontmatter.affiliation === 'string' ? frontmatter.affiliation : null;
  const institution = typeof frontmatter.institution === 'string' ? frontmatter.institution : null;
  const bio = typeof frontmatter.bio === 'string' ? frontmatter.bio : null;
  const expertise = Array.isArray(frontmatter.expertise) ? frontmatter.expertise : [];
  const keyPubs = Array.isArray(frontmatter.key_publications) ? frontmatter.key_publications : [];
  const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases.filter((a) => typeof a === 'string' && a) : [];

  return (
    <ArticleShell collection="people" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discordUrl={discordUrl}
      header={
        <>
          <div className="not-prose mb-3 flex flex-wrap items-center gap-x-3 text-xs uppercase tracking-wide text-gray-500">
            <span>Person</span>
            {affiliation && (
              <>
                <span>·</span>
                <AffiliationBadge value={affiliation} />
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">{name as string}</h1>
          {institution && (
            <p className="not-prose text-gray-600 mb-4">{institution}</p>
          )}
          {aliases.length > 0 && (
            <p className="not-prose text-sm text-gray-500 italic mb-4">
              Also known as: {aliases.join(', ')}
            </p>
          )}
          <ExampleBanner example={frontmatter.example} />
          {bio && <p className="not-prose text-lg text-gray-700 mb-6">{bio}</p>}

          <ContactLinks frontmatter={frontmatter} />

          {expertise.length > 0 && (
            <div className="not-prose my-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="text-xs uppercase tracking-wide text-gray-500">Expertise</span>
              <ul className="flex flex-wrap gap-2">
                {expertise.map((e, i) => (
                  <li key={i} className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                    {String(e)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <TagList tags={frontmatter.tags} />

          <div className="mt-2 space-y-1">
            <CollectionRefList
              label="Sources by author"
              collection="library"
              slugs={frontmatter.sources_by_author}
            />
          </div>

          {keyPubs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Key publications
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-800">
                {keyPubs.map((p, i) => <li key={i}>{String(p)}</li>)}
              </ul>
            </section>
          )}

          {(affiliation === 'cited-author' ||
            affiliation === 'external-author' ||
            affiliation === 'unclaimed') && (
            <ClaimProfileCTA name={name as string} />
          )}
        </>
      }
    >
      {html.trim() && (
        <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </ArticleShell>
  );
}

function ClaimProfileCTA({ name }: { name: string }) {
  return (
    <aside className="not-prose mt-10 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
      <h2 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide mb-2">
        Is this you?
      </h2>
      <p className="text-gray-800">
        Co-Goods has referenced {name}&rsquo;s work. If you&rsquo;d like to be
        involved — as advisor, collaborator, or to claim this profile — we&rsquo;d
        love to hear from you. Open an issue or say hi on Discord.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a
          href="https://github.com/co-goods/content/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
        >
          Open an issue on GitHub
        </a>
        <a
          href="https://discord.gg/8asdWDW5QY"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-indigo-300 px-3 py-1.5 text-indigo-700 hover:bg-indigo-100"
        >
          Join us on Discord
        </a>
      </div>
    </aside>
  );
}
