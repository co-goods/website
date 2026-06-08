import Link from 'next/link';
import { resolveRef, resolveQualifiedRef, ResolvedRef } from '@/lib/content/refs';
import { CollectionName } from '@/lib/content/collections';
import LicenseBadge from '@/components/LicenseBadge';

// ---------- DraftBanner ----------

// Render a maturity indicator for early-stage content. The stage ladder is
// stub → draft → published (published shows nothing). URLs stay stable across
// stage transitions; the banner is the only presentation difference.
export function DraftBanner({ stage }: { stage?: unknown }) {
  if (stage === 'stub') {
    return (
      <div className="mb-6 rounded border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span className="font-semibold">Stub</span>
        <span className="mx-1">·</span>
        <span>Outline only — this page is a placeholder for work that&apos;s coming.</span>
      </div>
    );
  }
  if (stage === 'draft') {
    return (
      <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span className="font-semibold">Draft</span>
        <span className="mx-1">·</span>
        <span>Work in progress. Open for feedback and contributions.</span>
      </div>
    );
  }
  return null;
}

// ---------- ExampleBanner ----------

// Items with `example: true` are template-exercise content, not claims of
// research-domain status. Useful while the seed content is dummy.
export function ExampleBanner({ example }: { example?: unknown }) {
  if (example !== true) return null;
  return (
    <div className="mb-6 rounded border border-gray-300 bg-gray-50 px-4 py-2 text-xs text-gray-600">
      Example content — used to exercise the template; not real research material.
    </div>
  );
}

// ---------- TagList ----------

export function TagList({ tags }: { tags?: unknown }) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  return (
    <ul className="not-prose flex flex-wrap gap-2 my-3">
      {tags.map((t) => {
        const slug = String(t);
        return (
          <li key={slug}>
            <Link
              href={`/tags/${slug}`}
              className="inline-block rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs text-gray-700"
            >
              {slug}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ---------- AuthorList ----------

// authors / contributors / editors / designers / reviewers — all resolve to
// people/<slug>.
export function PeopleList({
  label,
  slugs,
}: {
  label: string;
  slugs?: unknown;
}) {
  if (!Array.isArray(slugs) || slugs.length === 0) return null;
  const refs = slugs.map((s) => resolveRef('people', String(s)));
  return (
    <RefRow label={label} refs={refs} />
  );
}

// ---------- SourceList ----------

// `sources:` references library entries by slug.
export function SourceList({ slugs }: { slugs?: unknown }) {
  if (!Array.isArray(slugs) || slugs.length === 0) return null;
  const refs = slugs.map((s) => resolveRef('library', String(s)));
  return <RefRow label="Sources" refs={refs} />;
}

// ---------- ObservationList / InsightList / HypothesisList ----------

export function CollectionRefList({
  label,
  collection,
  slugs,
}: {
  label: string;
  // Accepts `'library'` as a virtual lookup across books/papers/publishers/publications.
  collection: CollectionName | 'library';
  slugs?: unknown;
}) {
  if (!Array.isArray(slugs) || slugs.length === 0) return null;
  const refs = slugs.map((s) => resolveRef(collection, String(s)));
  return <RefRow label={label} refs={refs} />;
}

// ---------- RelatedList ----------

// `related:` carries qualified-path entries like "glossary/<slug>". Bare
// entries fall through to /topics/<slug>.
export function RelatedList({ entries }: { entries?: unknown }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const refs = entries.map((e) => resolveQualifiedRef(String(e)));
  return <RefRow label="Related" refs={refs} />;
}

// ---------- Shared: RefRow ----------

function RefRow({ label, refs }: { label: string; refs: ResolvedRef[] }) {
  return (
    <div className="not-prose flex flex-wrap items-baseline gap-x-2 gap-y-1 my-2 text-sm">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {refs.map((r) => (
          <li key={r.url}>
            <Link
              href={r.url}
              className={
                r.exists
                  ? 'text-indigo-700 hover:underline'
                  : 'text-gray-500 italic hover:underline'
              }
              title={r.exists ? undefined : 'Unresolved link'}
            >
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- FrontmatterMeta ----------

// Compact metadata row for the article header: type, updated date, status.
export function FrontmatterMeta({
  frontmatter,
}: {
  frontmatter: Record<string, unknown>;
}) {
  const updated = typeof frontmatter.updated === 'string' ? frontmatter.updated.slice(0, 10) : null;
  const published = typeof frontmatter.publishedAt === 'string' ? frontmatter.publishedAt.slice(0, 10) : null;
  // The collection label is already shown by ArticleShell's eyebrow; this line
  // is just the date (the `type` field was retired in taxonomy v1).
  if (!published && !updated) return null;

  return (
    <div className="not-prose mb-3 flex flex-wrap items-baseline gap-x-3 text-xs uppercase tracking-wide text-gray-500">
      {published ? <span>Published {published}</span> : <span>Updated {updated}</span>}
    </div>
  );
}

// ---------- LicenseLine ----------

// Renders an item's per-item `license:` override (an SPDX id) as a linked
// badge. Absent license = nothing (the item inherits the collection default).
export function LicenseLine({ license, url }: { license?: unknown; url?: unknown }) {
  if (typeof license !== 'string' || !license.trim()) return null;
  return (
    <div className="not-prose mt-3">
      <LicenseBadge spdx={license} url={typeof url === 'string' ? url : undefined} label="Licensed" />
    </div>
  );
}

// ---------- Summary ----------

export function Summary({ summary }: { summary?: unknown }) {
  if (typeof summary !== 'string' || !summary.trim()) return null;
  return <p className="not-prose mb-6 text-lg text-gray-700">{summary}</p>;
}
