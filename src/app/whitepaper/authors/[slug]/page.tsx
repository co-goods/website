import { getContentBySlug, getAllSlugs } from '@/lib/markdown'
import { Author } from '@/types/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const slugs = getAllSlugs('authors')
  return slugs.map((slug) => ({ slug }))
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getContentBySlug('authors', slug)
  
  if (!author) {
    notFound()
  }

  const authorData = author.frontmatter as Author

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/whitepaper/authors" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Authors
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{authorData.name}</h1>
        
        {author.frontmatter.affiliation && (
          <p className="text-xl text-gray-600 mb-4">{author.frontmatter.affiliation}</p>
        )}

        <div className="flex gap-4 text-sm mb-6">
          {author.frontmatter.email && (
            <a href={`mailto:${author.frontmatter.email}`} className="text-blue-600 hover:text-blue-800">
              Email
            </a>
          )}
          {author.frontmatter.website && (
            <a href={author.frontmatter.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              Website
            </a>
          )}
          {author.frontmatter.orcid && (
            <a href={`https://orcid.org/${author.frontmatter.orcid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              ORCID
            </a>
          )}
        </div>

        {author.frontmatter.relevance_to_project && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Relevance to Co-Goods</h3>
            <p className="text-gray-700">{author.frontmatter.relevance_to_project}</p>
          </div>
        )}


        {author.frontmatter.key_publications && author.frontmatter.key_publications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Key Publications</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {author.frontmatter.key_publications.map((publication, index) => (
                <li key={index}>{publication}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: author.content }} />
      </div>

      {author.frontmatter.sources_by_author && author.frontmatter.sources_by_author.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Sources by this Author</h3>
          <div className="grid gap-3">
            {author.frontmatter.sources_by_author.map((sourceSlug) => (
              <Link 
                key={sourceSlug} 
                href={`/whitepaper/sources/${sourceSlug}`}
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

      {((author.frontmatter.tags && author.frontmatter.tags.length > 0) || 
        (author.frontmatter.expertise && author.frontmatter.expertise.length > 0)) && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {/* Combine tags and expertise, remove duplicates */}
            {Array.from(new Set([
              ...(author.frontmatter.tags || []),
              ...(author.frontmatter.expertise || [])
            ])).map((tag) => (
              <Link 
                key={tag} 
                href={`/whitepaper/tags/${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {author.frontmatter.collaboration_notes && (
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Collaboration Notes</h3>
          <p className="text-gray-700">{author.frontmatter.collaboration_notes}</p>
        </div>
      )}
    </div>
  )
}