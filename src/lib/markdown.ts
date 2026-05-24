import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { ContentType, ContentWithContent } from '@/types/content';
import { processObsidianLinks } from './linkProcessor';

const contentPath = path.join(process.cwd(), 'content');

export interface TocEntry {
  level: 2 | 3 | 4;
  text: string;
  id: string;
}

export interface RenderResult {
  html: string;
  toc: TocEntry[];
}

export interface ParsedDoc {
  frontmatter: Record<string, unknown>;
  body: string;
  rendered: RenderResult;
}

// GitHub-style heading slugification. Lowercase, replace whitespace with
// dashes, strip non-word chars except dashes.
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractToc(markdown: string): TocEntry[] {
  const toc: TocEntry[] = [];
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{2,4})\s+(.+?)\s*#*\s*$/);
    if (m) {
      toc.push({
        level: m[1].length as 2 | 3 | 4,
        text: m[2],
        id: slugifyHeading(m[2]),
      });
    }
  }
  return toc;
}

// Inject id attributes on h2/h3/h4 so the right-side TOC can link to them
// and IntersectionObserver can spy on them.
function injectHeadingIds(htmlStr: string): string {
  return htmlStr.replace(/<(h[2-4])>([\s\S]*?)<\/\1>/g, (_match, tag, content) => {
    const text = content.replace(/<[^>]+>/g, '');
    const id = slugifyHeading(text);
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
}

export async function renderMarkdown(rawMarkdown: string): Promise<RenderResult> {
  const toc = extractToc(rawMarkdown);
  const linked = processObsidianLinks(rawMarkdown);
  const processed = await remark().use(html).process(linked);
  const withIds = injectHeadingIds(processed.toString());
  return { html: withIds, toc };
}

export async function readAndRender(filepath: string): Promise<ParsedDoc> {
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);
  const rendered = await renderMarkdown(content);
  return { frontmatter: data, body: content, rendered };
}

// Helper function to normalize dates in frontmatter
function normalizeDates(data: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...data };

  for (const key in normalized) {
    if (normalized[key] instanceof Date) {
      normalized[key] = (normalized[key] as Date).toISOString();
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

      const normalizedData = normalizeDates(data);
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

  const normalizedData = normalizeDates(data);
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
      return path.join(contentPath, 'insights');
    case 'sources':
      return path.join(contentPath, 'sources');
    case 'authors':
      return path.join(contentPath, 'authors');
    case 'tags':
      return path.join(contentPath, 'tags');
    case 'contributors':
      return path.join(contentPath, 'contributors');
    case 'pages':
      return contentPath;
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
}

export async function getContributors(): Promise<ContentWithContent[]> {
  return getContentByType('contributors');
}
