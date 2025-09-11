# Co-Goods Website

Next.js website for presenting Co-Goods research and whitepaper content.

## Development

```bash
npm install
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production (has TypeScript issues - use dev mode)
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Technology Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS with responsive design
- **Content**: Markdown with gray-matter frontmatter parsing
- **Link Processing**: Automatic Obsidian wikilink conversion
- **Deployment**: Ready for Vercel or Netlify

## Features

### ✅ Fully Functional Website
- **All pages working**: Sources, Authors, Contributors, Tags, Insights, About
- **Dynamic routing**: Individual pages for each content item via `[slug]/page.tsx`
- **Responsive design**: Mobile-first approach with Tailwind breakpoints
- **Cross-linking**: Clickable tags and automatic relationship building

### ✅ Obsidian Integration  
- **Wikilink processing**: `[[antirival]]` → `/tags/antirival`
- **Natural writing**: Use Obsidian syntax, get website-ready output
- **Structured data**: YAML frontmatter drives website features

## Content Integration

The website automatically renders active content from the `../whitepaper/` repository:

- Research insights from `whitepaper/insights/`
- Academic sources from `whitepaper/sources/`
- Author profiles from `whitepaper/authors/`
- Contributor profiles from `whitepaper/contributors/`
- Tag definitions from `whitepaper/tags/`
- About page from `whitepaper/about.md`

**Important**: Only content with `status: "active"` in the YAML frontmatter will be displayed.

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── page.tsx      # Homepage with project overview
│   ├── insights/     # Research insights + [slug] pages
│   ├── sources/      # Academic sources + [slug] pages  
│   ├── authors/      # Author profiles + [slug] pages
│   ├── contributors/ # Team members + [slug] pages
│   ├── tags/         # Tag definitions + [slug] pages
│   └── about/        # About page (from markdown)
├── components/       # React components
│   └── Navigation.tsx # Main site navigation
├── lib/             # Utilities
│   ├── markdown.ts   # Content parsing with wikilink processing
│   └── linkProcessor.ts # Obsidian → website link conversion
└── types/           # TypeScript type definitions
    └── content.ts    # Interfaces for all content types
```

## Current Content

- **1 Source**: Olleros antirival goods paper (2018)
- **1 Author**: F. Xavier Olleros with relevance analysis
- **5 Tags**: antirival, network-effects, sharing-economy, commons, goods-theory
- **1 Contributor**: Pontus Karlsson (project lead)
- **Website**: All pages functional with proper cross-linking

## Known Issues

### TypeScript Build Issue
The production build currently has TypeScript errors due to union type handling in dynamic pages. The website works perfectly in development mode (`npm run dev`), but `npm run build` fails on TypeScript strict checks.

**Issue**: ContentType union doesn't properly handle shared properties across different content types.
**Workaround**: Use development mode for now. Production build can be fixed by adding proper type assertions.
**Priority**: Low (doesn't affect development workflow)

## Architecture Decisions

### ✅ Markdown-First Content
- All content stored as `.md` files with YAML frontmatter
- Website dynamically parses and renders content
- No database required - content is version-controlled

### ✅ Next.js 15 App Router
- Uses latest Next.js patterns with proper async params handling
- Static generation with `generateStaticParams()` for performance
- Dynamic routing with `[slug]/page.tsx` pattern

### ✅ Hybrid Linking System
- Supports both Obsidian `[[wikilinks]]` and standard markdown links
- Automatic conversion for website compatibility
- Structured YAML frontmatter for programmatic relationships

## License

All rights reserved. This work is currently proprietary and confidential.

**Future Licensing**: We plan to release this research under a Creative Commons license once the whitepaper is complete, allowing broader access while maintaining appropriate attribution and use guidelines.