import Link from 'next/link';

export default function ResearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
          Co-Goods Research
        </h1>
        <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          A research project focused on developing a protocol and token for co-created and networked physical products. 
          Our goal is to advance understanding of cooperative economics and sustainable production systems.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Link 
          href="/reports"
          className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10 hover:shadow-2xl transition-shadow"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Reports</h3>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive research reports including whitepapers and technical documentation.
            </p>
          </div>
        </Link>

        <Link 
          href="/resources/insights"
          className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10 hover:shadow-2xl transition-shadow"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Research Insights</h3>
            <p className="mt-2 text-sm text-gray-600">
              Categorized research findings from empirical, theoretical, and practical perspectives.
            </p>
          </div>
        </Link>

        <Link 
          href="/resources/sources"
          className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10 hover:shadow-2xl transition-shadow"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Academic Sources</h3>
            <p className="mt-2 text-sm text-gray-600">
              Curated collection of papers, books, and reports supporting our research.
            </p>
          </div>
        </Link>

        <Link 
          href="/resources/authors"
          className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10 hover:shadow-2xl transition-shadow"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Expert Authors</h3>
            <p className="mt-2 text-sm text-gray-600">
              Profiles of researchers and experts whose work informs our protocol development.
            </p>
          </div>
        </Link>

        <Link 
          href="/resources/tags"
          className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10 hover:shadow-2xl transition-shadow"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Tags</h3>
            <p className="mt-2 text-sm text-gray-600">
              Conceptual categories and themes that organize our research content.
            </p>
          </div>
        </Link>

        <Link 
          href="/contributors"
          className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10 hover:shadow-2xl transition-shadow"
        >
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Contributors</h3>
            <p className="mt-2 text-sm text-gray-600">
              Team members and project contributors working on the Co-Goods protocol.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}