import ContributeCallout from '@/components/sections/ContributeCallout';

interface PlainPageLayoutProps {
  frontmatter: Record<string, unknown>;
  html: string;
  editUrl?: string;
  discord?: string;
}

// Layout for plain-page standalones (manifesto, root CONTRIBUTING.md). No
// collection breadcrumb, no per-collection chrome — just centered title +
// markdown body. Site-specific framing for these pages is intended to come
// via overlays; not wired in this layout yet.
export default function PlainPageLayout({ frontmatter, html, editUrl, discord }: PlainPageLayoutProps) {
  const title =
    (typeof frontmatter.title === 'string' && frontmatter.title) || '';

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {title && (
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
      )}
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <ContributeCallout editUrl={editUrl} discord={discord} />
    </div>
  );
}
