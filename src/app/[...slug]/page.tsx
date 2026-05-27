import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import path from 'path';
import { resolveUrl } from '@/lib/content/resolver';
import { isCollectionEnabled, isIndexable } from '@/site.config';
import { readAndRender } from '@/lib/markdown';
import { loadOverlay } from '@/lib/overlays';
import { getDocsTree, findDocByUrl, findPrevNext } from '@/lib/content/docs';
import {
  getCollectionIndex,
  getDocsCategoryIndex,
  getResearchAuthorsIndex,
  getResearchSourcesIndex,
  getResearchTagsIndex,
  getUmbrellaIndex,
} from '@/lib/content/index-data';
import { enumerateAllParams } from '@/lib/content/enumerate';
import DocLayout from '@/components/layouts/DocLayout';
import DocsIndexLayout from '@/components/layouts/DocsIndexLayout';
import ArticleLayout from '@/components/layouts/ArticleLayout';
import CollectionIndexLayout from '@/components/layouts/CollectionIndexLayout';
import UmbrellaLandingLayout from '@/components/layouts/UmbrellaLandingLayout';
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

  // Umbrella landings — /thinking, /resources, /research
  if (resolved.kind === 'umbrella') {
    const data = getUmbrellaIndex(resolved.name);
    return <UmbrellaLandingLayout name={resolved.name} data={data} />;
  }

  // Derived filter views — /research/sources, /research/tags
  if (resolved.kind === 'derived') {
    if (resolved.view === 'research-sources') {
      const data = getResearchSourcesIndex();
      return (
        <CollectionIndexLayout
          data={data}
          collectionName="library"
          segments={['research', 'sources']}
        />
      );
    }
    if (resolved.view === 'research-tags') {
      const data = getResearchTagsIndex();
      return (
        <CollectionIndexLayout
          data={data}
          collectionName="tags"
          segments={['research', 'tags']}
        />
      );
    }
    if (resolved.view === 'research-authors') {
      const data = getResearchAuthorsIndex();
      return (
        <CollectionIndexLayout
          data={data}
          collectionName="people"
          segments={['research', 'authors']}
        />
      );
    }
    notFound(); // exhaustive over derived views; also narrows `resolved` below
  }

  // Below: standard page / index resolution
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

  // Merge bodyTitle as a frontmatter fallback if frontmatter.title is missing.
  // This avoids the duplicate-H1 issue: the layout's h1 uses the body's H1
  // text, and the H1 has already been stripped from the rendered body.
  const mergedFrontmatter =
    parsed.bodyTitle && !parsed.frontmatter.title
      ? { ...parsed.frontmatter, title: parsed.bodyTitle }
      : parsed.frontmatter;

  // Overlay (splice) sections live parallel to the source at
  // content/overlays/<collection-folder>/<slug>.md; absent for most pages.
  const overlaySlug = path.basename(resolved.filepath, '.md');
  const overlay = await loadOverlay(resolved.collection.folder, overlaySlug);

  const articleProps = {
    segments: resolved.innerSegments,
    frontmatter: mergedFrontmatter,
    html: parsed.rendered.html,
    toc: parsed.rendered.toc,
    overlay,
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
