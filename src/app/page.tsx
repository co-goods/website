export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          Co-Goods Research
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          A research project focused on developing a protocol and token for co-created and networked physical products. 
          Our goal is to advance understanding of cooperative economics and sustainable production systems.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/insights"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Explore Insights
          </a>
          <a href="/about" className="text-sm font-semibold leading-6 text-gray-900">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10">
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Research Insights</h3>
            <p className="mt-2 text-sm text-gray-600">
              Categorized research findings from empirical, theoretical, and practical perspectives.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10">
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Academic Sources</h3>
            <p className="mt-2 text-sm text-gray-600">
              Curated collection of papers, books, and reports supporting our research.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10">
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Expert Authors</h3>
            <p className="mt-2 text-sm text-gray-600">
              Profiles of researchers and experts whose work informs our protocol development.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:px-10">
          <div className="mx-auto max-w-md">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Protocol Whitepaper</h3>
            <p className="mt-2 text-sm text-gray-600">
              Our comprehensive research culminates in a whitepaper detailing the co-goods protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}