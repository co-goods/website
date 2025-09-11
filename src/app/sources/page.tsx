import { getContentByType } from '@/lib/markdown'
import { Source } from '@/types/content'
import Link from 'next/link'

export default async function SourcesPage() {
  const sources = await getContentByType<Source>('sources')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sources</h1>
        <p className="text-lg text-gray-600">
          Academic papers, publications, and other sources that inform our co-goods research.
        </p>
      </div>

      <div className="grid gap-6">
        {sources.map((source) => (
          <div key={source.slug} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <Link 
                href={`/sources/${source.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                {source.frontmatter.title}
              </Link>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {source.frontmatter.source_type}
                </span>
                {source.frontmatter.peer_reviewed && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                    Peer Reviewed
                  </span>
                )}
                {source.frontmatter.open_access && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">
                    Open Access
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">
                {source.frontmatter.authors.join(', ')} • {source.frontmatter.publication_date}
              </p>
            </div>
            
            {source.frontmatter.key_points && source.frontmatter.key_points.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Key Points:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {source.frontmatter.key_points.slice(0, 3).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {source.frontmatter.tags && source.frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {source.frontmatter.tags.map((tag) => (
                  <Link 
                    key={tag} 
                    href={`/tags/${tag}`}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {sources.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No sources have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}