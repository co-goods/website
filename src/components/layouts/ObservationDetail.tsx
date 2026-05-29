import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  CollectionRefList,
  DraftBanner,
  ExampleBanner,
  PeopleList,
  RelatedList,
  SourceList,
  Summary,
  TagList,
} from './atoms';

interface ObservationDetailProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}

export default function ObservationDetail({ segments, frontmatter, html, toc, overlay, editUrl, discord }: ObservationDetailProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Observation';

  const year = frontmatter['year-of-observation'];

  return (
    <ArticleShell collection="observations" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <div className="not-prose mb-3 flex flex-wrap items-baseline gap-x-3 text-xs uppercase tracking-wide text-gray-500">
            <span>Observation</span>
            {year != null && <span>· Observed {String(year)}</span>}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />
          <Summary summary={frontmatter.summary} />

          <PeopleList label="Authors" slugs={frontmatter.authors} />

          <div className="mt-2 space-y-1">
            <SourceList slugs={frontmatter.sources} />
            <CollectionRefList
              label="Related observations"
              collection="observations"
              slugs={frontmatter.related_observations}
            />
          </div>

          <TagList tags={frontmatter.tags} />
          <RelatedList entries={frontmatter.related} />
        </>
      }
    >
      {html.trim() && (
        <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </ArticleShell>
  );
}
