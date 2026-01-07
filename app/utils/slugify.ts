/**
 * Deterministic slugging utility for company names and content slugs.
 * Ensures consistent, SEO-friendly URLs with no ambiguity.
 * 
 * Rules:
 * - Lowercase only
 * - Hyphens for word separation
 * - Strip all punctuation except hyphens
 * - Collapse multiple hyphens
 * - Trim hyphens from edges
 */
export function slugify(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all punctuation except hyphens
    .replace(/[^\w-]/g, '')
    // Collapse multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate that a slug matches the deterministic format.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

