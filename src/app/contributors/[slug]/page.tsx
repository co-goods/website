import { getContentBySlug, getAllSlugs } from '@/lib/markdown'
import { Contributor } from '@/types/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const slugs = getAllSlugs('contributors')
  return slugs.map((slug) => ({ slug }))
}

export default async function ContributorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const contributor = await getContentBySlug('contributors', slug)
  
  if (!contributor) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/contributors" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Contributors
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{contributor.frontmatter.name}</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xl text-gray-600">{contributor.frontmatter.role}</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            contributor.frontmatter.status === 'active' ? 'bg-green-100 text-green-800' :
            contributor.frontmatter.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {contributor.frontmatter.status}
          </span>
        </div>

        <div className="flex gap-4 text-sm mb-6">
          {contributor.frontmatter.email && (
            <a href={`mailto:${contributor.frontmatter.email}`} className="text-blue-600 hover:text-blue-800">
              Email
            </a>
          )}
          {contributor.frontmatter.github && (
            <a 
              href={`https://github.com/${contributor.frontmatter.github}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              GitHub
            </a>
          )}
        </div>

        {contributor.frontmatter.expertise && contributor.frontmatter.expertise.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {contributor.frontmatter.expertise.map((area) => (
                <span key={area} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: contributor.content }} />
      </div>

      {contributor.frontmatter.tags && contributor.frontmatter.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {contributor.frontmatter.tags.map((tag) => (
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

      <div className="mt-8 text-sm text-gray-500">
        <p>Created: {contributor.frontmatter.created}</p>
        <p>Last Updated: {contributor.frontmatter.updated}</p>
      </div>
    </div>
  )
}