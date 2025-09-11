import { getContentByType } from '@/lib/markdown'
import { Contributor } from '@/types/content'
import Link from 'next/link'

export default async function ContributorsPage() {
  const contributors = await getContentByType<Contributor>('contributors')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contributors</h1>
        <p className="text-lg text-gray-600">
          Team members and researchers actively working on the co-goods project.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contributors.map((contributor) => (
          <div key={contributor.slug} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <Link 
                href={`/contributors/${contributor.slug}`}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
              >
                {contributor.frontmatter.name}
              </Link>
              <p className="text-gray-600 font-medium">{contributor.frontmatter.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  contributor.frontmatter.status === 'active' ? 'bg-green-100 text-green-800' :
                  contributor.frontmatter.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {contributor.frontmatter.status}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{contributor.frontmatter.bio}</p>
            
            {contributor.frontmatter.expertise && contributor.frontmatter.expertise.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Expertise:</h3>
                <div className="flex flex-wrap gap-2">
                  {contributor.frontmatter.expertise.slice(0, 3).map((area) => (
                    <span key={area} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 text-sm">
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
          </div>
        ))}

        {contributors.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No contributors have been added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}