import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// People are markdown items in the content repo (content/people/<slug>.md).
// This loads their frontmatter for listing surfaces like the Core Team grid —
// the `team` block reads it. (Full profiles still render via the people
// collection + PersonProfile layout.)

const PEOPLE_DIR = path.join(process.cwd(), 'content', 'people');

export interface Person {
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  affiliation?: string;
  github?: string;
  website?: string;
  status?: string;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export function loadPeople(): Person[] {
  if (!fs.existsSync(PEOPLE_DIR)) return [];
  return fs
    .readdirSync(PEOPLE_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('template-'))
    .map(f => {
      const { data } = matter(fs.readFileSync(path.join(PEOPLE_DIR, f), 'utf8'));
      const slug = str(data.slug) ?? f.replace(/\.md$/, '');
      return {
        slug,
        name: str(data.name) ?? slug,
        role: str(data.role),
        bio: str(data.bio),
        affiliation: str(data.affiliation),
        github: str(data.github),
        website: str(data.website),
        status: str(data.status),
      };
    });
}
