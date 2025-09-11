import { getContentBySlug, getAllSlugs } from '@/lib/markdown'
import { Insight } from '@/types/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const slugs = getAllSlugs('insights')
  return slugs.map((slug) => ({ slug }))
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const insight = await getContentBySlug('insights', slug)
  
  if (!insight) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/insights" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Insights
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{insight.frontmatter.title}</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm ${
            insight.frontmatter.category === 'theoretical' ? 'bg-purple-100 text-purple-800' :
            insight.frontmatter.category === 'empirical' ? 'bg-green-100 text-green-800' :
            insight.frontmatter.category === 'anecdotal' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {insight.frontmatter.category}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            Quality: {insight.frontmatter.quality_rating}/5
          </span>
        </div>

        <div className="text-gray-600 mb-6">
          <p className="mb-2">
            <strong>Editor:</strong> {insight.frontmatter.editor}
          </p>
          <p className="mb-2">
            <strong>Created:</strong> {insight.frontmatter.created}
          </p>
          <p className="mb-2">
            <strong>Updated:</strong> {insight.frontmatter.updated}
          </p>
        </div>

        {insight.frontmatter.key_finding && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Key Finding</h3>
            <p className="text-gray-700">{insight.frontmatter.key_finding}</p>
          </div>
        )}

        {insight.frontmatter.implications && insight.frontmatter.implications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Implications</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {insight.frontmatter.implications.map((implication, index) => (
                <li key={index}>{implication}</li>
              ))}
            </ul>
          </div>
        )}

        {insight.frontmatter.sources && insight.frontmatter.sources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Sources</h3>
            <div className="grid gap-3">
              {insight.frontmatter.sources.map((sourceSlug) => (
                <Link 
                  key={sourceSlug} 
                  href={`/sources/${sourceSlug}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    {sourceSlug.replace(/-/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: insight.content }} />
      </div>

      {insight.frontmatter.limitations && insight.frontmatter.limitations.length > 0 && (
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">Limitations</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {insight.frontmatter.limitations.map((limitation, index) => (
              <li key={index}>{limitation}</li>
            ))}
          </ul>
        </div>
      )}

      {insight.frontmatter.tags && insight.frontmatter.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {insight.frontmatter.tags.map((tag) => (
              <Link 
                key={tag} 
                href={`/tags/${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}