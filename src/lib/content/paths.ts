import path from 'path';

// Root of the content repo.
//
// In production (and on Vercel) this is the `content/` submodule mount at the
// project root. For **local review** it can be pointed at a working-tree clone
// via the `CONTENT_DIR` env var — e.g.
//
//   CONTENT_DIR=~/repositories/co-goods/content-staging next dev
//
// so unstaged content renders without committing or bumping the submodule.
// All content readers import CONTENT_ROOT from here so the override is honoured
// everywhere from one place.
export const CONTENT_ROOT = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR.replace(/^~(?=$|\/)/, process.env.HOME || ''))
  : path.join(process.cwd(), 'content');
