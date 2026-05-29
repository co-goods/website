import Link from 'next/link';
import { DocItem } from '@/lib/content/docs';

// Main-column body for docs index + root pages: a title and one or more
// sections of item links. (Article pages render their prose instead.)
export interface DocSection {
  title?: string;
  url?: string;
  items: DocItem[];
}

export default function DocListing({
  title,
  description,
  sections,
}: {
  title: string;
  description?: string;
  sections: DocSection[];
}) {
  const hasAny = sections.some(s => s.items.length > 0);
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-600 mb-8">{description}</p>}

      {!hasAny ? (
        <p className="text-gray-500">Nothing here yet.</p>
      ) : (
        <div className="space-y-8">
          {sections.map((section, i) => (
            <section key={section.title ?? i}>
              {section.title && (
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  {section.url ? (
                    <Link href={section.url} className="hover:text-indigo-700">
                      {section.title}
                    </Link>
                  ) : (
                    section.title
                  )}
                </h2>
              )}
              <ul className="space-y-2">
                {section.items.map(item => (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className="text-indigo-700 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
