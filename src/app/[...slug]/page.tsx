import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import path from 'path';
import { resolveUrl } from '@/lib/content/resolver';
import { isCollectionEnabled, isIndexable } from '@/site.config';
import { readAndRender } from '@/lib/markdown';
import { loadOverlay } from '@/lib/overlays';
import {
  getCollectionIndex,
  getResearchAuthorsIndex,
  getResearchSourcesIndex,
  getResearchTagsIndex,
  getUmbrellaIndex,
} from '@/lib/content/index-data';
import { enumerateAllParams } from '@/lib/content/enumerate';
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

  // Plain-page standalones (manifesto, root CONTRIBUTING.md). Rendered via
  // ArticleLayout for now; a dedicated PlainPage layout lands in a follow-up.
  if (resolved.kind === 'standalone') {
    const parsed = await readAndRender(resolved.filepath);
    const mergedFrontmatter =
      parsed.bodyTitle && !parsed.frontmatter.title
        ? { ...parsed.frontmatter, title: parsed.bodyTitle }
        : parsed.frontmatter;
    return (
      <ArticleLayout
        collection="standalone"
        segments={[]}
        frontmatter={mergedFrontmatter}
        html={parsed.rendered.html}
        toc={parsed.rendered.toc}
      />
    );
  }

  // Umbrella landings — /thinking, /resources, /research, /docs, /resources/library
  if (resolved.kind === 'umbrella') {
    const data = getUmbrellaIndex(resolved.name);
    return <UmbrellaLandingLayout name={resolved.name} data={data} />;
  }

  // Derived filter views — /research/sources, /research/tags, /research/authors
  if (resolved.kind === 'derived') {
    if (resolved.view === 'research-sources') {
      const data = getResearchSourcesIndex();
      return (
        <CollectionIndexLayout
          data={data}
          collectionName="books"
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
    const data = getCollectionIndex(resolved.collection.name, resolved.innerSegments);
    return (
      <CollectionIndexLayout
        data={data}
        collectionName={resolved.collection.name}
        segments={resolved.innerSegments}
      />
    );
  }

  // resolved.kind === 'page'
  const parsed = await readAndRender(resolved.filepath);

  // Merge bodyTitle as a frontmatter fallback if frontmatter.title is missing.
  // This avoids the duplicate-H1 issue: the layout's h1 uses the body's H1
  // text, and the H1 has already been stripped from the rendered body.
  const mergedFrontmatter =
    parsed.bodyTitle && !parsed.frontmatter.title
      ? { ...parsed.frontmatter, title: parsed.bodyTitle }
      : parsed.frontmatter;

  // Overlay (splice) sections live parallel to the source at
  // overlays/<collection-folder>/<slug>.md in the website repo; absent for most pages.
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
