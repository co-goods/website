/**
 * Processes content to convert Obsidian wikilinks to website-compatible links
 */
export function processObsidianLinks(content: string): string {
  // Convert [[tag-name]] to proper tag links
  content = content.replace(/\[\[([a-z0-9-]+)\]\]/g, (match, slug) => {
    // Determine content type based on common patterns
    if (isTag(slug)) {
      return `[${slug}](/tags/${slug})`;
    } else if (isAuthor(slug)) {
      return `[${slug}](/authors/${slug})`;
    } else if (isSource(slug)) {
      return `[${slug}](/sources/${slug})`;
    } else if (isInsight(slug)) {
      return `[${slug}](/insights/${slug})`;
    } else if (isContributor(slug)) {
      return `[${slug}](/contributors/${slug})`;
    }
    
    // Default: assume it's a tag
    return `[${slug}](/tags/${slug})`;
  });

  // Convert [[Display Name|slug]] format
  content = content.replace(/\[\[([^|]+)\|([a-z0-9-]+)\]\]/g, (match, displayName, slug) => {
    if (isTag(slug)) {
      return `[${displayName}](/tags/${slug})`;
    } else if (isAuthor(slug)) {
      return `[${displayName}](/authors/${slug})`;
    }
    // Add other types as needed
    return `[${displayName}](/tags/${slug})`;
  });

  return content;
}

// Helper functions to determine content type from slug patterns
function isTag(slug: string): boolean {
  // Tags typically use single words or concepts
  return !slug.includes('-2') && !slug.includes('f-') && !slug.includes('-analysis');
}

function isAuthor(slug: string): boolean {
  // Authors typically have firstname-lastname format or specific known authors
  return slug === 'f-xavier-olleros' || (slug.includes('-') && slug.match(/^[a-z]+-[a-z]+(-[a-z]+)?$/));
}

function isSource(slug: string): boolean {
  // Sources often include years or long descriptive names
  return slug.includes('-20') || slug.includes('-paper-') || slug.includes('-study-');
}

function isInsight(slug: string): boolean {
  // Insights often have analysis, patterns, etc.
  return slug.includes('-analysis') || slug.includes('-patterns') || slug.includes('-insights');
}

function isContributor(slug: string): boolean {
  // Contributors are project team members
  return slug === 'pontus-karlsson' || slug.includes('-contributor');
}

/**
 * Enhanced version that could use a lookup table for more accuracy
 */
export function processObsidianLinksWithLookup(
  content: string, 
  contentRegistry: { [slug: string]: string }
): string {
  return content.replace(/\[\[([a-z0-9-]+)\]\]/g, (match, slug) => {
    const contentType = contentRegistry[slug];
    if (contentType) {
      return `[${slug}](/${contentType}/${slug})`;
    }
    return match; // Keep original if not found
  });
}