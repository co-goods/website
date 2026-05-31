import Link from 'next/link';

// A single content card. Dual-use, like the other blocks: imported directly by
// layouts (e.g. the umbrella pillar pages) and rendered from a `cardgrid` block
// on composed pages. A card with `href` is clickable as a whole; `cta` adds a
// visible "read more" affordance. `id` makes the card an in-page anchor target.
//
// TODO: migrate to Grund — the canonical card Component once the design system
// covers cards.

export interface CardProps {
  title: string;
  body?: string;
  href?: string;
  cta?: string;
  eyebrow?: string;
  id?: string;
  external?: boolean;
}

export default function Card({ title, body, href, cta, eyebrow, id, external }: CardProps) {
  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const inner = (
    <>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {eyebrow}
        </p>
      )}
      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700">
        {title}
        {href && !cta && (
          <span aria-hidden="true" className="ml-1">→</span>
        )}
      </h3>
      {body && <p className="mt-2 text-sm text-gray-600">{body}</p>}
      {href && cta && (
        <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-700 group-hover:text-indigo-800">
          {cta}
          <span aria-hidden="true" className="ml-1">→</span>
        </span>
      )}
    </>
  );

  const cardClass =
    'h-full rounded-lg border border-gray-200 bg-white p-6 transition-colors' +
    (href ? ' hover:border-indigo-300' : '');

  return (
    <div id={id} className={id ? 'scroll-mt-20' : undefined}>
      {href ? (
        <Link href={href} {...linkProps} className={`group flex flex-col ${cardClass}`}>
          {inner}
        </Link>
      ) : (
        <div className={cardClass}>{inner}</div>
      )}
    </div>
  );
}
