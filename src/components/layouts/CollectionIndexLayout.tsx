import Link from 'next/link';
import { IndexData } from '@/lib/content/index-data';

interface CollectionIndexLayoutProps {
  data: IndexData;
  collectionName: string;
  segments: string[];
}

export default function CollectionIndexLayout({
  data, collectionName, segments,
}: CollectionIndexLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-4 text-xs text-gray-500 uppercase tracking-wide">
        {collectionName}
        {segments.length > 0 && ' / ' + segments.join(' / ')}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.title}</h1>
      {data.description && (
        <p className="text-gray-600 mb-8">{data.description}</p>
      )}

      {data.items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No items yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border-t border-gray-200">
          {data.items.map(item => (
            <li key={item.url} className="py-4">
              <Link href={item.url} className="group block">
                <div className="text-lg font-medium text-gray-900 group-hover:text-indigo-700">
                  {item.title}
                </div>
                {item.summary && (
                  <div className="text-sm text-gray-600 mt-1">{item.summary}</div>
                )}
                <div className="text-xs text-gray-400 mt-1">{item.url}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
