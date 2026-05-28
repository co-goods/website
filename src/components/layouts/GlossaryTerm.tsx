import { TocEntry } from '@/lib/markdown';
import ArticleShell from './ArticleShell';
import type { OverlaySlots } from '@/lib/overlays';
import {
  CollectionRefList,
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
  discordUrl?: string;
}

// Dictionary Schema class-entry shape:
//   { type: 'noun' | 'verb' | 'adjective' | ..., definitions: string[], forms?: { ... } }
interface ClassEntry {
  type?: string;
  definitions?: string[];
  forms?: Record<string, string>;
  examples?: string[];
}

function ClassBlock({ entry }: { entry: ClassEntry }) {
  const type = entry.type || 'term';
  const defs = Array.isArray(entry.definitions) ? entry.definitions : [];
  const forms = entry.forms && typeof entry.forms === 'object' ? entry.forms : null;
  const examples = Array.isArray(entry.examples) ? entry.examples : [];

  return (
    <section className="not-prose mb-6 border-l-2 border-indigo-200 pl-4">
      <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-2">
        {type}
      </h2>
      {defs.length > 0 && (
        <ol className="list-decimal pl-5 space-y-1 text-gray-800">
          {defs.map((d, i) => <li key={i}>{d}</li>)}
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

export default function GlossaryTerm({ segments, frontmatter, html, toc, overlay, editUrl, discordUrl }: GlossaryTermProps) {
  const name =
    (typeof frontmatter.name === 'string' && frontmatter.name) ||
    (typeof frontmatter.title === 'string' && frontmatter.title) ||
    segments[segments.length - 1] ||
    'Term';

  const classes = Array.isArray(frontmatter.classes) ? (frontmatter.classes as ClassEntry[]) : [];

  const relationships = (frontmatter.relationships as Record<string, unknown>) || {};
  const relatedTerms = Array.isArray(relationships.related_terms) ? relationships.related_terms : [];

  const links = Array.isArray(frontmatter.links) ? frontmatter.links : [];

  return (
    <ArticleShell collection="glossary" segments={segments} toc={toc} overlay={overlay} editUrl={editUrl} discordUrl={discordUrl}
      header={
        <>
          <div className="not-prose mb-3 text-xs uppercase tracking-wide text-gray-500">
            Glossary entry
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{name as string}</h1>
          <ExampleBanner example={frontmatter.example} />
          <DraftBanner stage={frontmatter.stage} />

          {classes.map((c, i) => <ClassBlock key={i} entry={c} />)}

          <CollectionRefList
            label="Related terms"
            collection="glossary"
            slugs={relatedTerms}
          />

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
    </ArticleShell>
  );
}
