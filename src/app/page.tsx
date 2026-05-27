import fs from 'fs';
import path from 'path';
import { renderPageBlocks } from '@/lib/renderBlocks';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

const HOME_PATH = path.join(process.cwd(), 'content', 'pages', 'home.md');

export default async function HomePage() {
  const markdown = fs.readFileSync(HOME_PATH, 'utf8');
  const blocks = await renderPageBlocks(markdown);
  return <BlockRenderer blocks={blocks} />;
}
