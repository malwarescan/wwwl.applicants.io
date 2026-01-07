/**
 * Entity Normalization
 * 
 * Normalizes raw candidate strings into canonical entities
 * following the exact ruleset specified.
 */

import type { Candidate } from '../reddit/types'
import type { Entity } from './types'

/**
 * Unicode + whitespace normalization
 */
function normalizeUnicodeWhitespace(raw: string): string {
  // NFKC normalize
  let normalized = raw.normalize('NFKC')
  
  // Trim
  normalized = normalized.trim()
  
  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ')
  
  // Remove surrounding quotes/backticks
  normalized = normalized.replace(/^["'`]+|["'`]+$/g, '')
  
  return normalized
}

/**
 * Strip trailing/leading punctuation
 */
function stripPunctuation(text: string): string {
  // Remove trailing punctuation
  let cleaned = text.replace(/[.,;:!?)\]]+$/g, '')
  
  // Remove leading punctuation
  cleaned = cleaned.replace(/^[([{"'`]+/g, '')
  
  return cleaned.trim()
}

/**
 * Standardize connectors (for canonicalKey only)
 */
function standardizeConnectors(text: string, forKey: boolean): string {
  if (forKey) {
    // Replace "&" with "and" for canonicalKey
    return text.replace(/\s*&\s*/g, ' and ')
  }
  return text
}

/**
 * Remove corporate suffixes
 */
function stripCorporateSuffixes(text: string): string {
  const suffixPattern = /\b(incorporated|inc\.?|llc|l\.l\.c\.?|ltd\.?|limited|co\.?|company|corp\.?|corporation|plc|gmbh|sarl|s\.r\.l\.?|s\.a\.s\.?|s\.a\.?|lp|llp)\b\.?$/i
  
  let cleaned = text
  let previous = ''
  
  // Apply repeatedly until no change
  while (cleaned !== previous) {
    previous = cleaned
    cleaned = cleaned.replace(suffixPattern, '').trim()
  }
  
  return cleaned
}

/**
 * Strip generic tail words (with safety checks)
 */
function stripGenericTailWords(text: string): string {
  const genericWords = [
    'marketing', 'events', 'consulting', 'solutions', 'systems',
    'group', 'international', 'media', 'communications', 'management',
    'enterprises', 'enterprise', 'holdings', 'partners', 'partner',
    'services', 'service'
  ]
  
  const pattern = new RegExp(`\\b(${genericWords.join('|')})\\b$`, 'i')
  let cleaned = text.replace(pattern, '').trim()
  
  // Safety check: only strip if remaining name is valid
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 0)
  const hasInternalCapital = /[A-Z][a-z]/.test(cleaned)
  
  if (tokens.length >= 2) {
    return cleaned
  }
  
  if (cleaned.length >= 8 && hasInternalCapital) {
    return cleaned
  }
  
  // Revert if unsafe
  return text
}

/**
 * Case normalization
 */
function normalizeCase(text: string, forKey: boolean): string {
  if (forKey) {
    // canonicalKey: lowercase, remove punctuation except spaces/hyphens
    let key = text.toLowerCase()
    key = key.replace(/[^\w\s-]/g, '')
    key = key.replace(/\s+/g, ' ')
    return key.trim()
  } else {
    // displayName: preserve TitleCase if present
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(text)) {
      return text // Already TitleCase
    }
    
    // If ALL CAPS and length > 6, convert to Title Case
    if (/^[A-Z\s]+$/.test(text) && text.length > 6) {
      return text.split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    
    return text
  }
}

/**
 * Generate slug from canonicalKey
 */
function generateSlug(canonicalKey: string): string {
  let slug = canonicalKey.toLowerCase()
  
  // Replace spaces/underscores with hyphens
  slug = slug.replace(/[\s_]+/g, '-')
  
  // Strip non [a-z0-9-]
  slug = slug.replace(/[^a-z0-9-]/g, '')
  
  // Collapse hyphens
  slug = slug.replace(/-+/g, '-')
  
  // Trim hyphens
  slug = slug.replace(/^-+|-+$/g, '')
  
  return slug
}

/**
 * Normalize a single candidate to entity
 */
export function normalizeEntity(candidate: Candidate): Entity {
  let raw = candidate.raw
  
  // A) Unicode + whitespace
  raw = normalizeUnicodeWhitespace(raw)
  
  // B) Strip punctuation
  raw = stripPunctuation(raw)
  
  // C) Standardize connectors (for display, keep original)
  const displayName = raw
  const keyBase = standardizeConnectors(raw, true)
  
  // D) Remove corporate suffixes (for key)
  let keyText = stripCorporateSuffixes(keyBase)
  
  // E) Strip generic tail words (with safety)
  keyText = stripGenericTailWords(keyText)
  
  // F) Case normalization
  const canonicalName = normalizeCase(displayName, false)
  const canonicalKeyBase = normalizeCase(keyText, true)
  
  // Convert spaces to underscores for canonicalKey
  const canonicalKey = canonicalKeyBase.replace(/\s+/g, '_')
  
  // G) Generate slug
  const slug = generateSlug(canonicalKey)
  
  return {
    canonicalName,
    canonicalKey,
    slug,
    aliases: [candidate.raw], // Start with original
    mentions: candidate.evidence
  }
}

