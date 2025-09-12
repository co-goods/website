import { getContentBySlug, getAllSlugs } from '@/lib/markdown'
import { Tag } from '@/types/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const slugs = getAllSlugs('tags')
  return slugs.map((slug) => ({ slug }))
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tag = await getContentBySlug('tags', slug)
  
  if (!tag) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/tags" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Tags
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{tag.frontmatter.name}</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm ${
            tag.frontmatter.category === 'economic_theory' ? 'bg-purple-100 text-purple-800' :
            tag.frontmatter.category === 'technology' ? 'bg-green-100 text-green-800' :
            tag.frontmatter.category === 'methodology' ? 'bg-blue-100 text-blue-800' :
            tag.frontmatter.category === 'protocol_aspect' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {tag.frontmatter.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            tag.frontmatter.status === 'active' ? 'bg-green-100 text-green-800' :
            tag.frontmatter.status === 'deprecated' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {tag.frontmatter.status}
          </span>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{tag.frontmatter.description}</p>
        </div>

        {tag.frontmatter.usage_guidelines && tag.frontmatter.usage_guidelines.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Usage Guidelines</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {tag.frontmatter.usage_guidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ul>
          </div>
        )}

        {tag.frontmatter.related_tags && tag.frontmatter.related_tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Related Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tag.frontmatter.related_tags.map((relatedTag) => (
                <Link 
                  key={relatedTag} 
                  href={`/resources/tags/${relatedTag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {relatedTag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {tag.frontmatter.tagged_content_types && tag.frontmatter.tagged_content_types.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Used In Content Types</h3>
            <div className="flex flex-wrap gap-2">
              {tag.frontmatter.tagged_content_types.map((contentType) => (
                <span key={contentType} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {contentType}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: tag.content }} />
      </div>

      {tag.frontmatter.evolution_notes && (
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Evolution Notes</h3>
          <p className="text-gray-700">{tag.frontmatter.evolution_notes}</p>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <p>Editor: {tag.frontmatter.editor}</p>
        <p>Created: {tag.frontmatter.created}</p>
        <p>Last Updated: {tag.frontmatter.updated}</p>
      </div>
    </div>
  )
}