import fs from 'fs';
import path from 'path';
import { renderPageSections } from '@/lib/renderSections';
import { SectionRenderer } from '@/components/sections/SectionRenderer';

// Composed pages live in the website repo (not the content submodule).
const HOME_PATH = path.join(process.cwd(), 'pages', 'home.md');

export default async function HomePage() {
  const markdown = fs.readFileSync(HOME_PATH, 'utf8');
  const sections = await renderPageSections(markdown);
  return <SectionRenderer sections={sections} />;
}
