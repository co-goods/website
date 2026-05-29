import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  CollectionRefList,
  DraftBanner,
  ExampleBanner,
  PeopleList,
  RelatedList,
  Summary,
  TagList,
} from './atoms';

interface HypothesisDetailProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}

type ValidationStatus = 'pending' | 'validated' | 'invalidated' | 'revised';

const VALIDATION_STYLES: Record<ValidationStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-300',
  validated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  invalidated: 'bg-rose-50 text-rose-700 border-rose-200',
  revised: 'bg-amber-50 text-amber-700 border-amber-200',
};

function ValidationBadge({ status }: { status: string }) {
  const key = (status in VALIDATION_STYLES ? status : 'pending') as ValidationStatus;
  return (
    <span className={`not-prose inline-block rounded border px-2 py-0.5 text-xs font-medium ${VALIDATION_STYLES[key]}`}>
      {status}
    </span>
  );
}

export default function HypothesisDetail({ segments, frontmatter, html, toc, overlay, editUrl, discord }: HypothesisDetailProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Hypothesis';

  const validation = typeof frontmatter['validation-status'] === 'string'
    ? (frontmatter['validation-status'] as string)
    : null;
  const testDesign = typeof frontmatter['test-design'] === 'string'
    ? (frontmatter['test-design'] as string)
    : null;

  return (
    <ArticleShell collection="hypotheses" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <div className="not-prose mb-3 flex flex-wrap items-center gap-x-3 text-xs uppercase tracking-wide text-gray-500">
            <span>Hypothesis</span>
            {validation && (
              <>
                <span>·</span>
                <ValidationBadge status={validation} />
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />
          <Summary summary={frontmatter.summary} />

          <PeopleList label="Authors" slugs={frontmatter.authors} />

          <div className="mt-2 space-y-1">
            <CollectionRefList
              label="Upstream insights"
              collection="insights"
              slugs={frontmatter.insights}
            />
            <CollectionRefList
              label="Related hypotheses"
              collection="hypotheses"
              slugs={frontmatter.related_hypotheses}
            />
          </div>

          <TagList tags={frontmatter.tags} />
          <RelatedList entries={frontmatter.related} />

          {testDesign && (
            <section className="not-prose mt-8 rounded border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Test design
              </h2>
              <p className="text-gray-800 m-0">{testDesign}</p>
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
