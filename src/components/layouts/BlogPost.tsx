import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  DraftBanner,
  ExampleBanner,
  PeopleList,
  RelatedList,
  Summary,
  TagList,
} from './atoms';

interface BlogPostProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
}

export default function BlogPost({ segments, frontmatter, html, toc, overlay, editUrl, discord }: BlogPostProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Blog post';

  const published = typeof frontmatter.publishedAt === 'string'
    ? frontmatter.publishedAt.slice(0, 10)
    : (typeof frontmatter.updated === 'string' ? frontmatter.updated.slice(0, 10) : null);

  const cover = typeof frontmatter.coverImage === 'string' && frontmatter.coverImage.trim()
    ? frontmatter.coverImage
    : null;

  return (
    <ArticleShell collection="blog" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <div className="not-prose mb-3 flex flex-wrap items-baseline gap-x-3 text-xs uppercase tracking-wide text-gray-500">
            <span>Blog</span>
            {published && <span>· {published}</span>}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="not-prose w-full rounded mb-6" />
          )}
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
