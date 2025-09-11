import { getContentByType } from '@/lib/markdown'
import { Author } from '@/types/content'
import Link from 'next/link'

export default async function AuthorsPage() {
  const authors = await getContentByType<Author>('authors')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Authors</h1>
        <p className="text-lg text-gray-600">
          Researchers and scholars whose work contributes to our understanding of co-goods.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {authors.map((author) => (
          <div key={author.slug} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <Link 
                href={`/authors/${author.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                {author.frontmatter.name}
              </Link>
              {author.frontmatter.affiliation && (
                <p className="text-gray-600 mb-2">{author.frontmatter.affiliation}</p>
              )}
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{author.frontmatter.bio}</p>
            
            {author.frontmatter.relevance_to_project && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Relevance to Co-goods:</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{author.frontmatter.relevance_to_project}</p>
              </div>
            )}

            {author.frontmatter.key_publications && author.frontmatter.key_publications.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Key Publications:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {author.frontmatter.key_publications.slice(0, 2).map((publication, index) => (
                    <li key={index}>• {publication}</li>
                  ))}
                </ul>
              </div>
            )}

            {author.frontmatter.expertise && author.frontmatter.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {author.frontmatter.expertise.slice(0, 4).map((area) => (
                  <span key={area} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {authors.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No authors have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}