import { getContentBySlug } from '@/lib/markdown'
import { notFound } from 'next/navigation'

export default async function AboutPage() {
  const about = await getContentBySlug('pages', 'about')
  
  if (!about) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: about.content }} />
      </div>
    </div>
  )
}