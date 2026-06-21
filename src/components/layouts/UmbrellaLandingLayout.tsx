import Link from 'next/link';
import Card from '@/components/sections/Card';
import FilterableIndex from '@/components/FilterableIndex';
import { IndexData, UmbrellaIndexData } from '@/lib/content/index-data';

interface UmbrellaLandingLayoutProps {
  name: 'thinking' | 'resources' | 'research' | 'docs' | 'library';
  data: UmbrellaIndexData;
  // Optional combined entry list rendered below the nav cards (library only).
  reading?: IndexData;
}

// The three content pillars each invite participation, deep-linked to the
// matching section on the community page. docs/library have no such anchor.
const GET_INVOLVED_AREA: Partial<Record<UmbrellaLandingLayoutProps['name'], string>> = {
  thinking: 'our thinking',
  resources: 'resources',
  research: 'research',
};

export default function UmbrellaLandingLayout({ name, data, reading }: UmbrellaLandingLayoutProps) {
  const involvedArea = GET_INVOLVED_AREA[name];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{data.title}</h1>
        <p className="mt-3 text-lg text-gray-600 leading-relaxed">{data.description}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {data.sections.map(section => (
          <Card
            key={section.url}
            title={section.heading}
            body={section.description}
            href={section.url}
          />
        ))}
      </div>

      {reading && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{reading.title}</h2>
          {reading.description && (
            <p className="mt-2 mb-6 text-gray-600">{reading.description}</p>
          )}
          <FilterableIndex items={reading.items} defaultFilter="featured" />
        </section>
      )}

      {involvedArea && (
        <aside className="mt-12 rounded-lg border border-indigo-200 bg-indigo-50 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-indigo-900">
              Want to contribute to {involvedArea}?
            </h2>
            <p className="mt-1 text-sm text-indigo-700">
              Co-Goods is open research — help shape this work.
            </p>
          </div>
          <Link
            href={`/community#${name}`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get involved
          </Link>
        </aside>
      )}
    </div>
  );
}
