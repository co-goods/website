import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Co-Goods
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/research" className="text-gray-700 hover:text-gray-900">
              Research
            </Link>
            <Link href="/schemas" className="text-gray-700 hover:text-gray-900">
              Schemas
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