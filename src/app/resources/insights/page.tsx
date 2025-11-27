import { getContentByType } from '@/lib/markdown'
import { Insight } from '@/types/content'
import Link from 'next/link'

export default async function InsightsPage() {
  const insights = await getContentByType<Insight>('insights')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Insights</h1>
        <p className="text-lg text-gray-600">
          Research findings, theoretical analysis, and empirical observations about co-goods.
        </p>
      </div>

      <div className="grid gap-6">
        {insights.map((insight) => (
          <div key={insight.slug} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <Link 
                href={`/resources/insights/${insight.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                {insight.frontmatter.title}
              </Link>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-2 py-1 text-sm rounded ${
                  insight.frontmatter.category === 'theoretical' ? 'bg-purple-100 text-purple-800' :
                  insight.frontmatter.category === 'empirical' ? 'bg-green-100 text-green-800' :
                  insight.frontmatter.category === 'anecdotal' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insight.frontmatter.category}
                </span>
                <span className={`px-2 py-1 text-sm rounded ${
                  insight.frontmatter.relevance_score === 'high' ? 'bg-blue-100 text-blue-800' :
                  insight.frontmatter.relevance_score === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insight.frontmatter.relevance_score}
                </span>
              </div>
              <p className="text-gray-600 mb-3">
                Editor: {insight.frontmatter.editor} • {insight.frontmatter.created}
              </p>
            </div>
            
            {insight.frontmatter.key_finding && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Key Finding:</h3>
                <p className="text-gray-700">{insight.frontmatter.key_finding}</p>
              </div>
            )}

            {insight.frontmatter.implications && insight.frontmatter.implications.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Implications:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {insight.frontmatter.implications.slice(0, 2).map((implication, index) => (
                    <li key={index}>{implication}</li>
                  ))}
                </ul>
              </div>
            )}

            {insight.frontmatter.tags && insight.frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insight.frontmatter.tags.map((tag) => (
                  <Link 
                    key={tag} 
                    href={`/resources/tags/${tag}`}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No insights have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}