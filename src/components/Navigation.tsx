import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Co-Goods Research
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/insights" className="text-gray-700 hover:text-gray-900">
              Insights
            </Link>
            <Link href="/sources" className="text-gray-700 hover:text-gray-900">
              Sources
            </Link>
            <Link href="/authors" className="text-gray-700 hover:text-gray-900">
              Authors
            </Link>
            <Link href="/contributors" className="text-gray-700 hover:text-gray-900">
              Contributors
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-gray-900">
              Tags
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}