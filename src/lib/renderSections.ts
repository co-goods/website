import matter from 'gray-matter';
import { parseSections } from './sectionParser';
import { renderMarkdown } from './markdown';
import { SECTION_SPECS } from '@/components/sections/registry';
import type { RenderedSection } from '@/components/sections/SectionRenderer';

// A single-paragraph body is unwrapped from its <p> so sections that place their
// body inline (quote, callout) flow correctly; multi-paragraph bodies (prose)
// keep their paragraph structure.
function unwrapSoleParagraph(html: string): string {
  const trimmed = html.trim();
  const paragraphCount = trimmed.match(/<p>/g)?.length ?? 0;
  if (paragraphCount === 1 && /^<p>[\s\S]*<\/p>$/.test(trimmed)) {
    return trimmed.replace(/^<p>/, '').replace(/<\/p>$/, '');
  }
  return html;
}

// Render a single section's markdown body to HTML. Shared by the page-section and
// overlay pipelines so both treat single- vs multi-paragraph bodies the same.
export async function renderSectionBody(bodyMarkdown: string): Promise<string> {
  if (!bodyMarkdown) return '';
  return unwrapSoleParagraph((await renderMarkdown(bodyMarkdown)).html);
}

// Parse a custom page's markdown into sections and pre-render the markdown body
// of each body-rich section to HTML (rendering is async; components are not).
// Any leading frontmatter (title, layout, …) is stripped first.
export async function renderPageSections(raw: string): Promise<RenderedSection[]> {
  const { content } = matter(raw);
  const parsed = parseSections(content, SECTION_SPECS);
  return Promise.all(
    parsed.map(async (section) => ({
      name: section.name,
      props: section.props,
      bodyHtml: await renderSectionBody(section.bodyMarkdown),
    }))
  );
}
