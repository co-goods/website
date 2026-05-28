import Link from 'next/link';
import { UmbrellaIndexData } from '@/lib/content/index-data';

interface UmbrellaLandingLayoutProps {
  name: 'thinking' | 'resources' | 'research' | 'docs' | 'library';
  data: UmbrellaIndexData;
}

export default function UmbrellaLandingLayout({ data }: UmbrellaLandingLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{data.title}</h1>
        <p className="mt-3 text-lg text-gray-600 leading-relaxed">{data.description}</p>
      </header>

      <ul className="space-y-6">
        {data.sections.map(section => (
          <li
            key={section.url}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-indigo-300 transition-colors"
          >
            <Link href={section.url} className="group block">
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-700">
                {section.heading} <span aria-hidden="true" className="ml-1">→</span>
              </h2>
              {section.description && (
                <p className="mt-2 text-sm text-gray-600">{section.description}</p>
              )}
              <p className="mt-2 text-xs font-mono text-gray-400">{section.url}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
