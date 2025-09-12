export default function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
          Reports
        </h1>
        <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          Comprehensive research reports, whitepapers, and technical documentation covering the Co-Goods protocol and related research findings.
        </p>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-700 mb-6">
            We are currently working on our comprehensive whitepaper and additional research reports. These will be made available as they are completed.
          </p>
          <div className="text-sm text-gray-600">
            <p>Planned reports include:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Co-Goods Protocol Whitepaper</li>
              <li>Technical Implementation Guide</li>
              <li>Economic Model Analysis</li>
              <li>Network Effects Research</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}