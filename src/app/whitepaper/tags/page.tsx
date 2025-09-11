import { getContentByType } from '@/lib/markdown'
import { Tag } from '@/types/content'
import Link from 'next/link'

export default async function TagsPage() {
  const tags = await getContentByType<Tag>('tags')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tags</h1>
        <p className="text-lg text-gray-600">
          Conceptual categories and themes that organize our co-goods research.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <div key={tag.slug} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <Link 
                href={`/whitepaper/tags/${tag.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                {tag.frontmatter.name}
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-sm rounded ${
                  tag.frontmatter.category === 'economic_theory' ? 'bg-purple-100 text-purple-800' :
                  tag.frontmatter.category === 'technology' ? 'bg-green-100 text-green-800' :
                  tag.frontmatter.category === 'methodology' ? 'bg-blue-100 text-blue-800' :
                  tag.frontmatter.category === 'protocol_aspect' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tag.frontmatter.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  tag.frontmatter.status === 'active' ? 'bg-green-100 text-green-800' :
                  tag.frontmatter.status === 'deprecated' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {tag.frontmatter.status}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{tag.frontmatter.description}</p>
            
            {tag.frontmatter.usage_guidelines && tag.frontmatter.usage_guidelines.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Usage Guidelines:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {tag.frontmatter.usage_guidelines.slice(0, 2).map((guideline, index) => (
                    <li key={index}>• {guideline}</li>
                  ))}
                </ul>
              </div>
            )}

            {tag.frontmatter.related_tags && tag.frontmatter.related_tags.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Related Tags:</h3>
                <div className="flex flex-wrap gap-1">
                  {tag.frontmatter.related_tags.slice(0, 3).map((relatedTag) => (
                    <span key={relatedTag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {relatedTag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tag.frontmatter.tagged_content_types && tag.frontmatter.tagged_content_types.length > 0 && (
              <div className="text-sm text-gray-500">
                Used in: {tag.frontmatter.tagged_content_types.join(', ')}
              </div>
            )}
          </div>
        ))}

        {tags.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No tags have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}