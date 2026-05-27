import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseBlocks } from './blockParser';
import { renderBlockBody } from './renderBlocks';
import { BLOCK_SPECS } from '@/components/blocks/registry';
import type { RenderedBlock } from '@/components/blocks/BlockRenderer';

// An overlay (splice) file layers site-specific sections onto a typed page
// without the source content knowing about it. It lives parallel to the source
// at content/overlays/<collection-folder>/<slug>.md, mirroring the source path.
//
// The file is ordinary fenced-block markdown: each top-level block is one
// spliced section. Splice metadata rides as reserved props on the block —
// `region` (where it lands), `position` (order within the region), and an
// optional `name` anchor — which are stripped before the block's own props
// reach its component. This reuses the page-block vocabulary verbatim; there is
// no second authoring mechanism.

const CONTENT_ROOT = path.join(process.cwd(), 'content');

type Region = 'top' | 'body' | 'sidebar' | 'bottom';
const REGIONS: Region[] = ['top', 'body', 'sidebar', 'bottom'];

// Pre-resolved render slots. `body` is split around `default` (the layout's own
// content — the markdown body) into the sections that precede and follow it.
export interface OverlaySlots {
  top: RenderedBlock[];
  bodyBefore: RenderedBlock[];
  bodyAfter: RenderedBlock[];
  sidebar: RenderedBlock[];
  bottom: RenderedBlock[];
}

function emptySlots(): OverlaySlots {
  return { top: [], bodyBefore: [], bodyAfter: [], sidebar: [], bottom: [] };
}

// `position` is `top` | `bottom` | `{ before: <anchor> }` | `{ after: <anchor> }`.
// Rank orders sections within a region: top first, bottom last, rest by file
// order (stable sort preserves it). `before:` ranks early, `after:` late.
function positionRank(position: unknown): number {
  if (position === 'top') return -1;
  if (position === 'bottom') return 1;
  if (position && typeof position === 'object') {
    if ('before' in (position as object)) return -1;
    if ('after' in (position as object)) return 1;
  }
  return 0;
}

// True when a body-region section should render before the default body
// content rather than after it.
function isBeforeDefault(position: unknown): boolean {
  if (position === 'top') return true;
  if (position && typeof position === 'object' && 'before' in (position as object)) {
    return (position as Record<string, unknown>).before === 'default';
  }
  return false;
}

// Read and resolve the overlay for a given page, or null when none exists.
export async function loadOverlay(
  collectionFolder: string,
  slug: string,
): Promise<OverlaySlots | null> {
  const filepath = path.join(CONTENT_ROOT, 'overlays', collectionFolder, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;

  const { content } = matter(fs.readFileSync(filepath, 'utf8'));
  const parsed = parseBlocks(content, BLOCK_SPECS);
  if (!parsed.length) return null;

  const sections = await Promise.all(
    parsed.map(async (block) => {
      const { region, position, name, ...props } = block.props as {
        region?: string;
        position?: unknown;
        name?: string;
      } & Record<string, unknown>;
      void name; // reserved anchor for relative positioning; not yet resolved
      return {
        region: (REGIONS.includes(region as Region) ? region : 'body') as Region,
        position,
        block: {
          name: block.name,
          props,
          bodyHtml: await renderBlockBody(block.bodyMarkdown),
        } as RenderedBlock,
      };
    }),
  );

  const slots = emptySlots();
  for (const region of REGIONS) {
    const inRegion = sections
      .filter((s) => s.region === region)
      .sort((a, b) => positionRank(a.position) - positionRank(b.position));
    for (const s of inRegion) {
      if (region === 'top') slots.top.push(s.block);
      else if (region === 'bottom') slots.bottom.push(s.block);
      else if (region === 'sidebar') slots.sidebar.push(s.block);
      else if (isBeforeDefault(s.position)) slots.bodyBefore.push(s.block);
      else slots.bodyAfter.push(s.block);
    }
  }
  return slots;
}
