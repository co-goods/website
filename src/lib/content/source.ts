import path from 'path';

// Content collection items + plain-page standalones live in the content repo.
// Their source file backs a single page, so we can offer an "edit on GitHub"
// link straight into the web editor (which forks + opens a PR). Composed pages
// (website repo) and derived/index pages (no single source) get no link.

import { CONTENT_ROOT } from './paths';
const CONTENT_REPO = 'co-goods/content';
// Contributions target the content repo's default branch, where PRs land.
const CONTENT_BRANCH = 'staging';

// Build the GitHub web-editor URL for a content-repo source file. `filepath`
// is the absolute path the resolver matched.
export function editUrlForContentFile(filepath: string): string {
  const rel = path.relative(CONTENT_ROOT, filepath).split(path.sep).join('/');
  return `https://github.com/${CONTENT_REPO}/edit/${CONTENT_BRANCH}/${rel}`;
}
