import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveUrl } from '@/lib/content/resolver';
import { isCollectionEnabled, isIndexable } from '@/site.config';
import { readAndRender } from '@/lib/markdown';
import { getDocsTree, findDocByUrl, findPrevNext } from '@/lib/content/docs';
import {
  getCollectionIndex,
  getDocsCategoryIndex,
} from '@/lib/content/index-data';
import { enumerateAllParams } from '@/lib/content/enumerate';
import DocLayout from '@/components/layouts/DocLayout';
import DocsIndexLayout from '@/components/layouts/DocsIndexLayout';
import ArticleLayout from '@/components/layouts/ArticleLayout';
import CollectionIndexLayout from '@/components/layouts/CollectionIndexLayout';
import WikiArticle from '@/components/layouts/WikiArticle';
import EssayDetail from '@/components/layouts/EssayDetail';
import LibraryEntry from '@/components/layouts/LibraryEntry';
import InsightDetail from '@/components/layouts/InsightDetail';
import ObservationDetail from '@/components/layouts/ObservationDetail';
import HypothesisDetail from '@/components/layouts/HypothesisDetail';
import PersonProfile from '@/components/layouts/PersonProfile';
import GlossaryTerm from '@/components/layouts/GlossaryTerm';
import BlogPost from '@/components/layouts/BlogPost';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return enumerateAllParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const url = '/' + slug.join('/');
  if (isIndexable(url)) {
    return {};
  }
  return {
    robots: { index: false, follow: false },
  };
}

export default async function CatchAll({ params }: PageProps) {
  const { slug } = await params;
  const resolved = resolveUrl(slug);
  if (!resolved) notFound();

  if (!isCollectionEnabled(resolved.collection.name)) {
    notFound();
  }

  if (resolved.kind === 'index') {
    const collectionName = resolved.collection.name;

    if (collectionName === 'docs') {
      const tree = getDocsTree();
      if (resolved.innerSegments.length === 0) {
        return <DocsIndexLayout tree={tree} />;
      }
      const { category } = getDocsCategoryIndex(resolved.innerSegments[0]);
      if (!category) notFound();
      return <DocsIndexLayout tree={tree} category={category} />;
    }

    const data = getCollectionIndex(collectionName, resolved.innerSegments);
    return (
      <CollectionIndexLayout
        data={data}
        collectionName={collectionName}
        segments={resolved.innerSegments}
      />
    );
  }

  // resolved.kind === 'page'
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

  const articleProps = {
    segments: resolved.innerSegments,
    frontmatter: parsed.frontmatter,
    html: parsed.rendered.html,
    toc: parsed.rendered.toc,
  };

  switch (resolved.collection.layout) {
    case 'WikiArticle':
      return <WikiArticle {...articleProps} />;
    case 'EssayDetail':
      return <EssayDetail {...articleProps} />;
    case 'LibraryEntry':
      return <LibraryEntry {...articleProps} />;
    case 'InsightDetail':
      return <InsightDetail {...articleProps} />;
    case 'ObservationDetail':
      return <ObservationDetail {...articleProps} />;
    case 'HypothesisDetail':
      return <HypothesisDetail {...articleProps} />;
    case 'PersonProfile':
      return <PersonProfile {...articleProps} />;
    case 'GlossaryTerm':
      return <GlossaryTerm {...articleProps} />;
    case 'BlogPost':
      return <BlogPost {...articleProps} />;
    default:
      return (
        <ArticleLayout
          collection={resolved.collection.name}
          {...articleProps}
        />
      );
  }
}
