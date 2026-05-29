import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  DraftBanner,
  ExampleBanner,
  PeopleList,
  TagList,
} from './atoms';

interface LibraryEntryProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}

const KNOWN_TYPES: Record<string, string> = {
  book: 'Book',
  paper: 'Paper',
  podcast: 'Podcast',
  'podcast-episode': 'Podcast episode',
  article: 'Article',
  post: 'Post',
  video: 'Video',
  course: 'Course',
};

type BadgeTone = 'cited' | 'featured' | 'peer';

const BADGE_STYLES: Record<BadgeTone, string> = {
  cited: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  featured: 'bg-amber-50 text-amber-700 border-amber-200',
  peer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function Badge({ children, tone }: { children: React.ReactNode; tone: BadgeTone }) {
  return (
    <span className={`not-prose inline-block rounded border px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[tone]}`}>
      {children}
    </span>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 py-1.5 border-b border-gray-100 text-sm">
      <dt className="text-gray-500 uppercase tracking-wide text-xs self-center">{label}</dt>
      <dd className="text-gray-900">{children}</dd>
    </div>
  );
}

export default function LibraryEntry({ segments, frontmatter, html, toc, overlay, editUrl, discord }: LibraryEntryProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Library entry';

  const type = typeof frontmatter.type === 'string' ? frontmatter.type : 'item';
  const typeLabel = KNOWN_TYPES[type] || type;

  const publisher = typeof frontmatter.publisher === 'string' ? frontmatter.publisher : null;
  const year = frontmatter.year != null ? String(frontmatter.year) : null;
  const isbn = typeof frontmatter.isbn === 'string' ? frontmatter.isbn : null;
  const url = typeof frontmatter.url === 'string' ? frontmatter.url : null;
  const serial = typeof frontmatter.serial === 'string' ? frontmatter.serial : null;
  const lang = typeof frontmatter.language === 'string' ? frontmatter.language : null;
  const methodology = typeof frontmatter.methodology === 'string' ? frontmatter.methodology : null;
  const relevance = typeof frontmatter.relevance_to_project === 'string' ? frontmatter.relevance_to_project : null;
  const ourTake = typeof frontmatter.our_take === 'string' ? frontmatter.our_take : null;

  const keyPoints = Array.isArray(frontmatter.key_points) ? frontmatter.key_points : [];

  const isCited = frontmatter['is-cited'] === true;
  const isFeatured = frontmatter['is-featured'] === true;
  const peerReviewed = frontmatter.peer_reviewed === true;
  const openAccess = frontmatter.open_access === true;

  return (
    <ArticleShell collection="library" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <div className="mb-3 not-prose flex flex-wrap items-baseline gap-x-3 text-xs uppercase tracking-wide text-gray-500">
            <span>{typeLabel}</span>
            {year && <span>· {year}</span>}
            {serial && <span>· {serial}</span>}
            {lang && <span>· {lang}</span>}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />

          <div className="not-prose flex flex-wrap gap-2 mb-4">
            {isCited && <Badge tone="cited">Cited</Badge>}
            {isFeatured && <Badge tone="featured">Featured</Badge>}
            {peerReviewed && <Badge tone="peer">Peer-reviewed</Badge>}
            {openAccess && <Badge tone="peer">Open access</Badge>}
          </div>

          <PeopleList label="Authors" slugs={frontmatter.authors} />

          <dl className="not-prose mt-6 mb-6 border-t border-gray-100">
            {publisher && <MetaRow label="Publisher">{publisher}</MetaRow>}
            {isbn && <MetaRow label="ISBN">{isbn}</MetaRow>}
            {url && (
              <MetaRow label="Source">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline break-all">
                  {url}
                </a>
              </MetaRow>
            )}
            {methodology && <MetaRow label="Methodology">{methodology}</MetaRow>}
            {relevance && <MetaRow label="Relevance">{relevance}</MetaRow>}
          </dl>

          <TagList tags={frontmatter.tags} />

          {keyPoints.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Key points</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-800">
                {keyPoints.map((p, i) => <li key={i}>{String(p)}</li>)}
              </ul>
            </section>
          )}

          {ourTake && ourTake.trim() && (
            <section className="mt-6 rounded border border-indigo-200 bg-indigo-50 p-4">
              <h2 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide mb-1">
                Our take
              </h2>
              <p className="text-gray-800 m-0">{ourTake}</p>
            </section>
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
