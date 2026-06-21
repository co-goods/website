import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { resolveUrl } from '@/lib/content/resolver';
import { isCollectionEnabled, isIndexable, discordKeyForArea } from '@/site.config';
import { readAndRender, renderMarkdown } from '@/lib/markdown';
import { renderPageSections } from '@/lib/renderSections';
import { SectionRenderer } from '@/components/sections/SectionRenderer';
import { loadOverlay } from '@/lib/overlays';
import {
  getCollectionIndex,
  getLibraryReadingIndex,
  getResearchAuthorsIndex,
  getResearchSourcesIndex,
  getResearchTagsIndex,
  getUmbrellaIndex,
} from '@/lib/content/index-data';
import { getTagsIndex, getTopicsIndex, getTagListing, getTopicHub, getGlossaryFacets } from '@/lib/content/concepts';
import { enumerateAllParams } from '@/lib/content/enumerate';
import { editUrlForContentFile } from '@/lib/content/source';
import { getDocsTree, findPrevNext, docCrumbs, groupCrumbs, findGroup } from '@/lib/content/docs';
import ArticleLayout from '@/components/layouts/ArticleLayout';
import DocLayout from '@/components/layouts/DocLayout';
import DocCardListing from '@/components/docs/DocCardListing';
import PlainPageLayout from '@/components/layouts/PlainPageLayout';
import CollectionIndexLayout from '@/components/layouts/CollectionIndexLayout';
import LicenseBadge from '@/components/LicenseBadge';
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
  // PlainPageLayout — title + body, no collection chrome.
  if (resolved.kind === 'standalone') {
    const parsed = await readAndRender(resolved.filepath);
    const mergedFrontmatter =
      parsed.bodyTitle && !parsed.frontmatter.title
        ? { ...parsed.frontmatter, title: parsed.bodyTitle }
        : parsed.frontmatter;
    return (
      <PlainPageLayout
        frontmatter={mergedFrontmatter}
        html={parsed.rendered.html}
        editUrl={editUrlForContentFile(resolved.filepath)}
        discord={(typeof mergedFrontmatter.discord === 'string' ? mergedFrontmatter.discord : undefined) ?? discordKeyForArea(slug[0])}
      />
    );
  }

  // Docs root — render in the docs shell (sidebar tree + index listing).
  if (resolved.kind === 'umbrella' && resolved.name === 'docs') {
    const tree = getDocsTree();
    const cards = tree.groups.map(g => ({
      title: g.title,
      href: g.url,
      body: g.description ?? `${g.items.length} ${g.items.length === 1 ? 'document' : 'documents'}`,
      cta: 'Browse',
    }));
    return (
      <DocLayout tree={tree} currentUrl="/docs" crumbs={[{ label: 'Docs' }]}>
        <DocCardListing
          title="Documentation"
          description="How content is organised, and how to contribute."
          cards={cards}
        />
      </DocLayout>
    );
  }

  // Umbrella landings — /thinking, /resources, /research, /resources/library
  if (resolved.kind === 'umbrella') {
    const data = getUmbrellaIndex(resolved.name);
    const reading = resolved.name === 'library' ? getLibraryReadingIndex() : undefined;
    return <UmbrellaLandingLayout name={resolved.name} data={data} reading={reading} />;
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
    if (resolved.view === 'tags-index') {
      return <CollectionIndexLayout data={getTagsIndex()} segments={['tags']} />;
    }
    if (resolved.view === 'topics-index') {
      return <CollectionIndexLayout data={getTopicsIndex()} segments={['topics']} />;
    }
    if (resolved.view === 'tag') {
      const data = getTagListing(resolved.slug!);
      if (!data) notFound();
      return <CollectionIndexLayout data={data} segments={['tags', resolved.slug!]} groupByType />;
    }
    if (resolved.view === 'topic') {
      const data = getTopicHub(resolved.slug!);
      if (!data) notFound();
      return <CollectionIndexLayout data={data} segments={['topics', resolved.slug!]} groupByType />;
    }
    notFound(); // exhaustive over derived views; also narrows `resolved` below
  }

  // Below: standard page / index resolution
  if (!isCollectionEnabled(resolved.collection.name)) {
    notFound();
  }

  if (resolved.kind === 'index') {
    // Docs collection / sub-collection index — docs shell + its listing.
    if (resolved.collection.urlPrefix.startsWith('/docs')) {
      const tree = getDocsTree();
      const group = findGroup(resolved.collection.name);
      const cards = group
        ? [
            ...group.items.map(it => ({ title: it.title, href: it.url, body: it.description })),
            ...group.subgroups.map(s => ({
              title: s.title,
              href: s.url,
              body: s.description ?? `${s.items.length} documents`,
              cta: 'Browse',
            })),
          ]
        : [];
      return (
        <DocLayout
          tree={tree}
          currentUrl={resolved.collection.urlPrefix}
          crumbs={groupCrumbs(resolved.collection.name)}
        >
          <DocCardListing
            title={group?.title ?? resolved.collection.name}
            description={group?.description}
            cards={cards}
          />
        </DocLayout>
      );
    }
    const data = getCollectionIndex(resolved.collection.name, resolved.innerSegments);
    const prefixSegments = resolved.collection.urlPrefix.replace(/^\//, '').split('/').filter(Boolean);
    return (
      <CollectionIndexLayout
        data={data}
        segments={[...prefixSegments, ...resolved.innerSegments]}
      />
    );
  }

  // resolved.kind === 'page'

  // Composed pages (the pages/ namespace) are authored as sections,
  // same as the home page — render them through the section pipeline rather
  // than as a markdown article.
  if (resolved.collection.name === 'pages') {
    const raw = fs.readFileSync(resolved.filepath, 'utf8');
    const sections = await renderPageSections(raw);
    const pageLicense = matter(raw).data.license;
    return (
      <>
        <SectionRenderer sections={sections} />
        {typeof pageLicense === 'string' && pageLicense.trim() && (
          <div className="px-4 sm:px-6 lg:px-8 pb-12">
            <div className="mx-auto max-w-3xl">
              <LicenseBadge spdx={pageLicense} label="Page licensed" />
            </div>
          </div>
        )}
      </>
    );
  }

  const parsed = await readAndRender(resolved.filepath);

  // Merge bodyTitle as a frontmatter fallback if frontmatter.title is missing.
  // This avoids the duplicate-H1 issue: the layout's h1 uses the body's H1
  // text, and the H1 has already been stripped from the rendered body.
  const mergedFrontmatter =
    parsed.bodyTitle && !parsed.frontmatter.title
      ? { ...parsed.frontmatter, title: parsed.bodyTitle }
      : parsed.frontmatter;

  // Docs article — the docs shell (sidebar tree, breadcrumbs, prev/next, TOC)
  // around the prose body.
  if (resolved.collection.urlPrefix.startsWith('/docs')) {
    const tree = getDocsTree();
    const url = '/' + slug.join('/');
    const title =
      (typeof mergedFrontmatter.title === 'string' && mergedFrontmatter.title) ||
      resolved.innerSegments[resolved.innerSegments.length - 1] ||
      'Doc';
    const { prev, next } = findPrevNext(url);
    return (
      <DocLayout
        tree={tree}
        currentUrl={url}
        crumbs={docCrumbs(url)}
        toc={parsed.rendered.toc}
        prev={prev}
        next={next}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: parsed.rendered.html }}
        />
      </DocLayout>
    );
  }

  // Overlay (splice) sections live parallel to the source at
  // overlays/<collection-folder>/<slug>.md in the website repo; absent for most pages.
  const overlaySlug = path.basename(resolved.filepath, '.md');
  const overlay = await loadOverlay(resolved.collection.folder, overlaySlug);

  const articleProps = {
    // Full URL path (incl. the slug) so layouts can render a breadcrumb; the
    // title fallback still uses the last segment (the slug).
    segments: slug,
    frontmatter: mergedFrontmatter,
    html: parsed.rendered.html,
    toc: parsed.rendered.toc,
    overlay,
    // Collection items are content-repo files — offer the edit + discuss links.
    editUrl: editUrlForContentFile(resolved.filepath),
    discord:
      (typeof mergedFrontmatter.discord === 'string' ? mergedFrontmatter.discord : undefined) ??
      discordKeyForArea(slug[0]),
  };

  // Render the frontmatter `relevance` (why this node matters to us) through the
  // markdown pipeline so emphasis and wikilinks resolve; layouts show it under a
  // "Relevance to Co-Goods" heading. Only the layouts where relevance applies
  // (wiki, library, person, glossary) receive it.
  const relevanceHtml =
    typeof mergedFrontmatter.relevance === 'string' && mergedFrontmatter.relevance.trim()
      ? (await renderMarkdown(mergedFrontmatter.relevance)).html
      : undefined;

  switch (resolved.collection.layout) {
    case 'WikiArticle':
      return <WikiArticle {...articleProps} relevanceHtml={relevanceHtml} />;
    case 'EssayDetail':
      return <EssayDetail {...articleProps} />;
    case 'LibraryEntry':
      return <LibraryEntry {...articleProps} relevanceHtml={relevanceHtml} />;
    case 'InsightDetail':
      return <InsightDetail {...articleProps} />;
    case 'ObservationDetail':
      return <ObservationDetail {...articleProps} />;
    case 'HypothesisDetail':
      return <HypothesisDetail {...articleProps} />;
    case 'PersonProfile':
      return <PersonProfile {...articleProps} relevanceHtml={relevanceHtml} />;
    case 'GlossaryTerm':
      return <GlossaryTerm {...articleProps} facets={getGlossaryFacets(slug[slug.length - 1])} relevanceHtml={relevanceHtml} />;
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
