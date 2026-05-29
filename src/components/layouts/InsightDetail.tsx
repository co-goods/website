import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  CollectionRefList,
  DraftBanner,
  ExampleBanner,
  FrontmatterMeta,
  PeopleList,
  RelatedList,
  SourceList,
  Summary,
  TagList,
} from './atoms';

interface InsightDetailProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}

function BulletSection({
  title,
  items,
}: {
  title: string;
  items: unknown;
}) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="not-prose mt-8 rounded border border-gray-200 bg-gray-50 p-5">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
        {title}
      </h2>
      <ul className="list-disc pl-5 space-y-1 text-gray-800">
        {items.map((p, i) => <li key={i}>{String(p)}</li>)}
      </ul>
    </section>
  );
}

export default function InsightDetail({ segments, frontmatter, html, toc, overlay, editUrl, discord }: InsightDetailProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Insight';

  return (
    <ArticleShell collection="insights" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <FrontmatterMeta collection="insights" frontmatter={frontmatter} />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />
          <Summary summary={frontmatter.summary} />

          <PeopleList label="Authors" slugs={frontmatter.authors} />

          <div className="mt-2 space-y-1">
            <CollectionRefList
              label="Upstream observations"
              collection="observations"
              slugs={frontmatter.observations}
            />
            <SourceList slugs={frontmatter.sources} />
            <CollectionRefList
              label="Related insights"
              collection="insights"
              slugs={frontmatter.related_insights}
            />
          </div>

          <TagList tags={frontmatter.tags} />
          <RelatedList entries={frontmatter.related} />

          <BulletSection title="Key findings" items={frontmatter.key_findings} />
          <BulletSection title="Implications" items={frontmatter.implications} />
          <BulletSection title="Research questions" items={frontmatter.research_questions} />
        </>
      }
    >
      {html.trim() && (
        <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </ArticleShell>
  );
}
