import matter from 'gray-matter';
import { parseBlocks } from './blockParser';
import { renderMarkdown } from './markdown';
import { BLOCK_SPECS } from '@/components/blocks/registry';
import type { RenderedBlock } from '@/components/blocks/BlockRenderer';

// Parse a custom page's markdown into blocks and pre-render the markdown body
// of each body-rich block to HTML (rendering is async; components are not).
// Any leading frontmatter (title, layout, …) is stripped first.
export async function renderPageBlocks(raw: string): Promise<RenderedBlock[]> {
  const { content } = matter(raw);
  const parsed = parseBlocks(content, BLOCK_SPECS);
  return Promise.all(
    parsed.map(async (block) => ({
      name: block.name,
      props: block.props,
      bodyHtml: block.bodyMarkdown
        ? (await renderMarkdown(block.bodyMarkdown)).html
        : '',
    }))
  );
}
