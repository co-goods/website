import fs from 'fs';
import path from 'path';
import { renderPageBlocks } from '@/lib/renderBlocks';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

// Composed pages live in the website repo (not the content submodule).
const HOME_PATH = path.join(process.cwd(), 'pages', 'home.md');

export default async function HomePage() {
  const markdown = fs.readFileSync(HOME_PATH, 'utf8');
  const blocks = await renderPageBlocks(markdown);
  return <BlockRenderer blocks={blocks} />;
}
