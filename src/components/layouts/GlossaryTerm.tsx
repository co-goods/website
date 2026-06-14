import Link from 'next/link';
import { TocEntry, renderMarkdown } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import type { GlossaryFacets } from '@/lib/content/concepts';
import { conceptUrl, getGlossaryEntry } from '@/lib/content/glossary';
import {
  DraftBanner,
  ExampleBanner,
  SourceList,
} from './atoms';

interface GlossaryTermProps {
  segments: string[];
  frontmatter: Record<string, unknown>;
  html: string;
  toc: TocEntry[];
  overlay?: OverlaySlots | null;
  editUrl?: string;
  discord?: string;
  facets?: GlossaryFacets | null;
}

// The "portal": below the definition, surface the roles this concept plays —
// a topic hub, a tag listing, a long-form wiki facet, a catalogued library
// work. All render in one consistent style: a label, the linked item(s), and
// an optional "see all" when there are more than the preview shows.
function FacetSection({
  label, items, seeAll,
}: {
  label: string;
  items: { title: string; url: string }[];
  seeAll?: { url: string; count: number; cta: string };
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-1">{label}</div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map(it => (
            <li key={it.url}>
              <Link href={it.url} className="text-gray-800 hover:text-indigo-700 hover:underline">{it.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">No items yet.</p>
      )}
      {seeAll && (
        <Link href={seeAll.url} className="inline-block mt-1 text-sm text-indigo-700 hover:underline">
          {seeAll.cta}{seeAll.count > items.length ? ` (${seeAll.count})` : ''} →
        </Link>
      )}
    </div>
  );
}

// Two distinct kinds of cross-link:
//   FORMS  — the same concept in another collection (wiki article, library work).
//            "This concept, elsewhere."
//   ROLES  — the concept used to organise other content (topic hub, tag listing).
//            "Browse other content by this concept."
function FacetPortal({ facets }: { facets: GlossaryFacets }) {
  const hasForms = facets.wiki || facets.library;
  const hasRoles = facets.about || facets.tagged;
  if (!hasForms && !hasRoles) return null;
  return (
    <section className="not-prose mt-10 border-t border-gray-200 pt-6" data-hovercard>
      {hasForms && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">This concept, elsewhere</h2>
          <div className="space-y-5">
            {facets.wiki && <FacetSection label="Wiki article" items={[facets.wiki]} />}
            {facets.library && (
              <FacetSection
                label={facets.library.typeLabel ? `In the library · ${facets.library.typeLabel}` : 'In the library'}
                items={[{ title: facets.library.title, url: facets.library.url }]} />
            )}
          </div>
        </div>
      )}
      {hasRoles && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Browse by this concept</h2>
          <div className="space-y-5">
            {facets.about && (
              <FacetSection label="As a topic" items={facets.about.preview}
                seeAll={{ url: facets.about.url, count: facets.about.count, cta: 'See the topic hub' }} />
            )}
            {facets.tagged && (
              <FacetSection label="As a tag" items={facets.tagged.preview}
                seeAll={{ url: facets.tagged.url, count: facets.tagged.count, cta: 'See all tagged' }} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Dictionary Schema class-entry shape:
//   { type: 'noun' | 'verb' | 'adjective' | ..., definitions: string[], forms?: { ... } }
interface ClassEntry {
  type?: string;
  definitions?: string[];
  // Definitions pre-rendered to HTML (so inline markdown — code, emphasis —
  // resolves rather than showing as literal source).
  definitionsHtml?: string[];
  forms?: Record<string, string>;
  examples?: string[];
}

function ClassBlock({ entry }: { entry: ClassEntry }) {
  const type = entry.type || 'term';
  const defs = Array.isArray(entry.definitionsHtml) ? entry.definitionsHtml : [];
  const forms = entry.forms && typeof entry.forms === 'object' ? entry.forms : null;
  const examples = Array.isArray(entry.examples) ? entry.examples : [];

  return (
    <section className="not-prose mb-6 border-l-2 border-indigo-200 pl-4">
      <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-2">
        {type}
      </h2>
      {defs.length > 0 && (
        <ol className="list-decimal pl-5 space-y-1 text-gray-800 [&_p]:inline [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:text-[0.9em]">
          {defs.map((d, i) => <li key={i} dangerouslySetInnerHTML={{ __html: d }} />)}
        </ol>
      )}
      {forms && Object.keys(forms).length > 0 && (
        <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-x-2 gap-y-1 text-sm">
          {Object.entries(forms).map(([form, value]) => (
            <div key={form} className="contents">
              <dt className="text-gray-500 uppercase tracking-wide text-xs self-center">{form}</dt>
              <dd className="text-gray-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
      {examples.length > 0 && (
        <ul className="mt-3 list-disc pl-5 space-y-1 text-gray-700 italic">
          {examples.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      )}
    </section>
  );
}

// A `type: comparison` entry contrasts two concepts. Instead of grammatical
// class blocks it carries a `comparison` block: prose `description` paragraphs
// plus an aspect-by-aspect table (term_a -> terms[0], term_b -> terms[1]).
interface ComparisonRow {
  aspect?: string;
  term_a?: string;
  term_b?: string;
}

function ComparisonBlock({
  termLinks, descriptionHtml, rows,
}: {
  termLinks: { slug: string; title: string; url: string }[];
  descriptionHtml: string[];
  rows: ComparisonRow[];
}) {
  const a = termLinks[0];
  const b = termLinks[1];
  return (
    <section className="not-prose mb-6">
      {descriptionHtml.length > 0 && (
        <div className="space-y-3 text-gray-800 [&_p]:m-0 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:text-[0.9em]">
          {descriptionHtml.map((d, i) => <div key={i} dangerouslySetInnerHTML={{ __html: d }} />)}
        </div>
      )}
      {rows.length > 0 && a && b && (
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-indigo-200 text-left align-bottom">
              <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Aspect</th>
              <th className="py-2 pr-4 font-semibold text-indigo-700">
                <Link href={a.url} className="hover:underline">{a.title}</Link>
              </th>
              <th className="py-2 font-semibold text-indigo-700">
                <Link href={b.url} className="hover:underline">{b.title}</Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 align-top">
                <td className="py-2 pr-4 font-medium text-gray-600">{row.aspect}</td>
                <td className="py-2 pr-4 text-gray-800">{row.term_a}</td>
                <td className="py-2 text-gray-800">{row.term_b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function GlossaryTerm({ segments, frontmatter, html, toc, overlay, editUrl, discord, facets }: GlossaryTermProps) {
  const name =
    (typeof frontmatter.name === 'string' && frontmatter.name) ||
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Term';

  const classes = Array.isArray(frontmatter.classes) ? (frontmatter.classes as ClassEntry[]) : [];
  // Render each definition's markdown (inline code, emphasis) to HTML.
  const classesHtml: ClassEntry[] = await Promise.all(
    classes.map(async c => ({
      ...c,
      definitionsHtml: await Promise.all(
        (Array.isArray(c.definitions) ? c.definitions : []).map(async d => (await renderMarkdown(String(d))).html),
      ),
    })),
  );

  const relationships = (frontmatter.relationships as Record<string, unknown>) || {};
  const relatedTerms = Array.isArray(relationships.related_terms) ? relationships.related_terms : [];
  // Resolve each related concept to its title + canonical URL (topic hub if the
  // term is a topic, else its glossary entry — same rule as bare body links).
  const relatedLinks = relatedTerms.map(s => {
    const slug = String(s);
    const e = getGlossaryEntry(slug);
    return { slug, title: e?.title ?? slug, url: conceptUrl(slug) ?? `/resources/glossary/${slug}` };
  });

  // Comparison entries (type: comparison) carry a `comparison` block rather
  // than grammatical classes; resolve its target terms + render its prose.
  const comparison =
    frontmatter.type === 'comparison' && frontmatter.comparison && typeof frontmatter.comparison === 'object'
      ? (frontmatter.comparison as { terms?: unknown; description?: unknown; detailed_comparison?: unknown })
      : null;
  const cmpTermLinks = (Array.isArray(comparison?.terms) ? comparison!.terms : []).map(s => {
    const slug = String(s);
    const e = getGlossaryEntry(slug);
    return { slug, title: e?.title ?? slug, url: conceptUrl(slug) ?? `/resources/glossary/${slug}` };
  });
  const cmpDescriptionHtml = await Promise.all(
    (Array.isArray(comparison?.description) ? comparison!.description : []).map(
      async d => (await renderMarkdown(String(d))).html,
    ),
  );
  const cmpRows = (Array.isArray(comparison?.detailed_comparison) ? comparison!.detailed_comparison : []) as ComparisonRow[];

  // "Not to be confused with" — sibling concepts this one is conflated with.
  const ntbcw = Array.isArray(frontmatter.not_to_be_confused_with) ? frontmatter.not_to_be_confused_with : [];
  const ntbcwLinks = ntbcw.map(s => {
    const slug = String(s);
    const e = getGlossaryEntry(slug);
    return { slug, title: e?.title ?? slug, url: conceptUrl(slug) ?? `/resources/glossary/${slug}` };
  });

  const links = Array.isArray(frontmatter.links) ? frontmatter.links : [];

  return (
    <ArticleShell collection="glossary" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discord={discord}
      header={
        <>
          <div className="not-prose mb-3 text-xs uppercase tracking-wide text-gray-500">
            Glossary entry
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{name as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />

          {classesHtml.map((c, i) => <ClassBlock key={i} entry={c} />)}

          {comparison && (
            <ComparisonBlock termLinks={cmpTermLinks} descriptionHtml={cmpDescriptionHtml} rows={cmpRows} />
          )}

          {ntbcwLinks.length > 0 && (
            <div className="not-prose my-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm" data-hovercard>
              <span className="text-xs uppercase tracking-wide text-gray-500">Not to be confused with</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {ntbcwLinks.map(r => (
                  <li key={r.slug}>
                    <Link href={r.url} className="text-indigo-700 hover:underline">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {relatedLinks.length > 0 && (
            <div className="not-prose my-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm" data-hovercard>
              <span className="text-xs uppercase tracking-wide text-gray-500">Related terms</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {relatedLinks.map(r => (
                  <li key={r.slug}>
                    <Link href={r.url} className="text-indigo-700 hover:underline">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SourceList slugs={frontmatter.sources} />

          {links.length > 0 && (
            <div className="not-prose my-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="text-xs uppercase tracking-wide text-gray-500">External</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={String(l)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 hover:underline break-all"
                    >
                      {String(l)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      }
    >
      {html.trim() && (
        <div className="prose prose-slate max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      )}
      {facets && <FacetPortal facets={facets} />}
    </ArticleShell>
  );
}
