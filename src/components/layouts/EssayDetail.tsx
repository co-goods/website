import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  DraftBanner,
  ExampleBanner,
  FrontmatterMeta,
  PeopleList,
  RelatedList,
  Summary,
  TagList,
} from './atoms';

interface EssayDetailProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
}

export default function EssayDetail({ segments, frontmatter, html, toc, overlay }: EssayDetailProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Essay';

  return (
    <ArticleShell collection="essays" segments={segments} toc={toc} overlay={overlay}
      header={
        <>
          <FrontmatterMeta collection="essays" frontmatter={frontmatter} />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />
          <Summary summary={frontmatter.summary} />
          <PeopleList label="By" slugs={frontmatter.authors} />
          <TagList tags={frontmatter.tags} />
          <RelatedList entries={frontmatter.related} />
        </>
      }
    >
      <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </ArticleShell>
  );
}
