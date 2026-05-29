import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  DraftBanner,
  ExampleBanner,
  FrontmatterMeta,
  RelatedList,
  Summary,
  TagList,
} from './atoms';

interface WikiArticleProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}

export default function WikiArticle({ segments, frontmatter, html, toc, overlay, editUrl, discord }: WikiArticleProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Wiki article';

  return (
    <ArticleShell collection="wiki" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <FrontmatterMeta collection="wiki" frontmatter={frontmatter} />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />
          <Summary summary={frontmatter.summary} />
          <TagList tags={frontmatter.tags} />
          <RelatedList entries={frontmatter.related} />
        </>
      }
    >
      <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </ArticleShell>
  );
}
