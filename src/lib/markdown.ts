import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { ContentType, ContentWithContent } from '@/types/content';
import { processObsidianLinks } from './linkProcessor';

const whitepaperPath = path.join(process.cwd(), 'whitepaper');

// Helper function to normalize dates in frontmatter
function normalizeDates(data: any): any {
  const normalized = { ...data };

  // Convert any Date objects to ISO strings
  for (const key in normalized) {
    if (normalized[key] instanceof Date) {
      normalized[key] = normalized[key].toISOString();
    }
  }

  return normalized;
}

export async function getContentByType(type: string): Promise<ContentWithContent[]> {
  const contentDir = getContentDirectory(type);
  
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md') && !file.startsWith('template-'));

  const content = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, '');
      const fullPath = path.join(contentDir, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // Normalize any Date objects to strings
      const normalizedData = normalizeDates(data);

      // Process Obsidian wikilinks before markdown processing
      const processedObsidianContent = processObsidianLinks(content);

      const processedContent = await remark()
        .use(html)
        .process(processedObsidianContent);

      return {
        frontmatter: normalizedData as ContentType,
        content: processedContent.toString(),
        slug,
      };
    })
  );

  return content.filter(item => item.frontmatter.status === 'active');
}

export async function getContentBySlug(type: string, slug: string): Promise<ContentWithContent | null> {
  const contentDir = getContentDirectory(type);
  const fullPath = path.join(contentDir, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Normalize any Date objects to strings
  const normalizedData = normalizeDates(data);

  // Process Obsidian wikilinks before markdown processing
  const processedObsidianContent = processObsidianLinks(content);

  const processedContent = await remark()
    .use(html)
    .process(processedObsidianContent);

  return {
    frontmatter: normalizedData as ContentType,
    content: processedContent.toString(),
    slug,
  };
}

export function getAllSlugs(type: string): string[] {
  const contentDir = getContentDirectory(type);
  
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  return fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md') && !file.startsWith('template-'))
    .map(file => file.replace(/\.md$/, ''));
}

function getContentDirectory(type: string): string {
  switch (type) {
    case 'insights':
      return path.join(whitepaperPath, 'insights');
    case 'sources':
      return path.join(whitepaperPath, 'sources');
    case 'authors':
      return path.join(whitepaperPath, 'authors');
    case 'tags':
      return path.join(whitepaperPath, 'tags');
    case 'contributors':
      return path.join(whitepaperPath, 'contributors');
    case 'pages':
      return whitepaperPath;
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
}

export async function getContributors(): Promise<ContentWithContent[]> {
  return getContentByType('contributors');
}