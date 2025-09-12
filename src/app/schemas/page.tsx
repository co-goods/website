export default function SchemasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
          JSON Schemas
        </h1>
        <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          We will start publishing JSON schemas for the Co-Goods protocol shortly. These schemas will define the structure and validation rules for co-goods data, enabling standardized implementation across different systems and platforms.
        </p>
      </div>

      <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-blue-800 mb-6">
            Our JSON schemas will cover protocol specifications, data structures, and API definitions to facilitate interoperability in the co-goods ecosystem.
          </p>
          <div className="text-sm text-blue-700">
            <p>Expected schema categories:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Product metadata and specifications</li>
              <li>Network effect measurements</li>
              <li>Cooperative ownership structures</li>
              <li>Token economics and governance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}