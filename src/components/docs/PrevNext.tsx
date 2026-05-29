import Link from 'next/link';
import { DocItem } from '@/lib/content/docs';

interface PrevNextProps {
  prev: DocItem | null;
  next: DocItem | null;
}

export default function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pager"
      className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-8"
    >
      <div>
        {prev && (
          <Link
            href={prev.url}
            className="group block rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-400 transition-colors"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide">Previous</div>
            <div className="text-base font-medium text-gray-900 group-hover:text-indigo-700">
              ← {prev.title}
            </div>
          </Link>
        )}
      </div>
      <div className="sm:text-right">
        {next && (
          <Link
            href={next.url}
            className="group block rounded-lg border border-gray-200 px-4 py-3 hover:border-indigo-400 transition-colors"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide">Next</div>
            <div className="text-base font-medium text-gray-900 group-hover:text-indigo-700">
              {next.title} →
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
