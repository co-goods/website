import { notFound } from 'next/navigation';
import { resolveUrl } from '@/lib/content/resolver';
import { readAndRender } from '@/lib/markdown';
import { getDocsTree, findDocByUrl, findPrevNext } from '@/lib/content/docs';
import { enumerateAllParams } from '@/lib/content/enumerate';
import DocLayout from '@/components/layouts/DocLayout';
import ArticleLayout from '@/components/layouts/ArticleLayout';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return enumerateAllParams();
}

export default async function CatchAll({ params }: PageProps) {
  const { slug } = await params;
  const resolved = resolveUrl(slug);
  if (!resolved) notFound();

  const parsed = await readAndRender(resolved.filepath);

  if (resolved.collection.name === 'docs') {
    const url = '/' + slug.join('/');
    const current = findDocByUrl(url);
    if (!current) notFound();
    const tree = getDocsTree();
    const { prev, next } = findPrevNext(url);
    return (
      <DocLayout
        tree={tree}
        current={current}
        prev={prev}
        next={next}
        html={parsed.rendered.html}
        toc={parsed.rendered.toc}
      />
    );
  }

  return (
    <ArticleLayout
      collection={resolved.collection.name}
      segments={resolved.innerSegments}
      frontmatter={parsed.frontmatter}
      html={parsed.rendered.html}
      toc={parsed.rendered.toc}
    />
  );
}
