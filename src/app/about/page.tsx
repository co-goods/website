import { Metadata } from 'next';
import { getContentBySlug } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import { isIndexable, isPageEnabled } from '@/site.config'

export const metadata: Metadata = isIndexable('/about')
  ? {}
  : { robots: { index: false, follow: false } };

export default async function AboutPage() {
  if (!isPageEnabled('about')) notFound();
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