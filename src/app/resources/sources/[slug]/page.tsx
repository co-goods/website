import { getContentBySlug, getAllSlugs } from '@/lib/markdown'
import { Source } from '@/types/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const slugs = getAllSlugs('sources')
  return slugs.map((slug) => ({ slug }))
}

export default async function SourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const source = await getContentBySlug('sources', slug)
  
  if (!source) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/sources" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Sources
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{source.frontmatter.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {source.frontmatter.source_type}
          </span>
          {source.frontmatter.peer_reviewed && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Peer Reviewed
            </span>
          )}
          {source.frontmatter.open_access && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              Open Access
            </span>
          )}
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            Quality: {source.frontmatter.quality_assessment}
          </span>
        </div>

        <div className="text-gray-600 mb-6">
          <p className="mb-2">
            <strong>Authors:</strong> {source.frontmatter.authors.join(', ')}
          </p>
          <p className="mb-2">
            <strong>Published:</strong> {source.frontmatter.publication_date}
          </p>
          {source.frontmatter.journal && (
            <p className="mb-2">
              <strong>Journal:</strong> {source.frontmatter.journal}
              {source.frontmatter.volume && `, Vol. ${source.frontmatter.volume}`}
              {source.frontmatter.issue && `, Issue ${source.frontmatter.issue}`}
            </p>
          )}
          {source.frontmatter.doi && (
            <p className="mb-2">
              <strong>DOI:</strong> <a href={source.frontmatter.doi} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">{source.frontmatter.doi}</a>
            </p>
          )}
          {source.frontmatter.url && (
            <p className="mb-2">
              <strong>URL:</strong> <a href={source.frontmatter.url} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">{source.frontmatter.url}</a>
            </p>
          )}
        </div>

        {source.frontmatter.relevance_to_project && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Relevance to Co-Goods</h3>
            <p className="text-gray-700">{source.frontmatter.relevance_to_project}</p>
          </div>
        )}

        {source.frontmatter.key_points && source.frontmatter.key_points.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Key Points</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {source.frontmatter.key_points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: source.content }} />
      </div>

      {source.frontmatter.limitations && source.frontmatter.limitations.length > 0 && (
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">Limitations</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {source.frontmatter.limitations.map((limitation, index) => (
              <li key={index}>{limitation}</li>
            ))}
          </ul>
        </div>
      )}

      {source.frontmatter.tags && source.frontmatter.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {source.frontmatter.tags.map((tag) => (
              <Link 
                key={tag} 
                href={`/resources/tags/${tag}`}
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