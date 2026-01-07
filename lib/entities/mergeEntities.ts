/**
 * Entity Merging
 * 
 * Merges duplicate entities based on high-precision rules
 */

import type { Entity } from './types'

/**
 * Calculate Jaccard similarity of token sets
 */
function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().split(/\s+/).filter(t => t.length > 0))
  const tokensB = new Set(b.toLowerCase().split(/\s+/).filter(t => t.length > 0))
  
  const intersection = new Set([...tokensA].filter(t => tokensB.has(t)))
  const union = new Set([...tokensA, ...tokensB])
  
  if (union.size === 0) return 0
  return intersection.size / union.size
}

/**
 * Check if entity contains city/state tokens
 */
function containsLocationTokens(entity: Entity): boolean {
  const locationKeywords = [
    'miami', 'tampa', 'rochester', 'atlanta', 'chicago', 'dallas',
    'houston', 'phoenix', 'philadelphia', 'san', 'los', 'new', 'york',
    'florida', 'texas', 'california', 'new york', 'illinois'
  ]
  
  const text = `${entity.canonicalName} ${entity.canonicalKey}`.toLowerCase()
  return locationKeywords.some(keyword => text.includes(keyword))
}

/**
 * Check if entities have matching first token
 */
function firstTokenMatches(a: Entity, b: Entity): boolean {
  const tokenA = a.canonicalKey.split('_')[0] || a.canonicalKey
  const tokenB = b.canonicalKey.split('_')[0] || b.canonicalKey
  return tokenA.toLowerCase() === tokenB.toLowerCase()
}

/**
 * Check token count difference
 */
function tokenCountDifference(a: Entity, b: Entity): number {
  const countA = a.canonicalKey.split('_').length
  const countB = b.canonicalKey.split('_').length
  return Math.abs(countA - countB)
}

/**
 * Check if entity is too short (risky to merge)
 */
function isTooShort(entity: Entity): boolean {
  const tokens = entity.canonicalKey.split('_').filter(t => t.length > 0)
  return tokens.length <= 1
}

/**
 * Determine if two entities should merge
 */
export function shouldMerge(a: Entity, b: Entity): boolean {
  // Exact match on canonicalKey
  if (a.canonicalKey === b.canonicalKey) {
    return true
  }
  
  // Jaccard similarity check
  const similarity = jaccardSimilarity(a.canonicalKey, b.canonicalKey)
  
  if (similarity < 0.9) {
    return false
  }
  
  // Must have matching first token
  if (!firstTokenMatches(a, b)) {
    return false
  }
  
  // Length difference must be <= 2 tokens
  if (tokenCountDifference(a, b) > 2) {
    return false
  }
  
  // Do NOT merge if either contains location tokens while other doesn't
  const aHasLocation = containsLocationTokens(a)
  const bHasLocation = containsLocationTokens(b)
  if (aHasLocation !== bHasLocation) {
    return false
  }
  
  // Do NOT merge if either is too short
  if (isTooShort(a) || isTooShort(b)) {
    return false
  }
  
  // Check for unique brand tokens
  const tokensA = new Set(a.canonicalKey.split('_').filter(t => t.length > 0))
  const tokensB = new Set(b.canonicalKey.split('_').filter(t => t.length > 0))
  
  const uniqueToA = [...tokensA].filter(t => !tokensB.has(t))
  const uniqueToB = [...tokensB].filter(t => !tokensA.has(t))
  
  // If there are significant unique tokens, don't merge
  if (uniqueToA.length > 1 || uniqueToB.length > 1) {
    return false
  }
  
  return true
}

/**
 * Merge two entities
 */
export function mergeEntities(a: Entity, b: Entity): Entity {
  // Prefer longer canonical name
  const canonicalName = a.canonicalName.length >= b.canonicalName.length
    ? a.canonicalName
    : b.canonicalName
  
  // Prefer shorter canonical key (more normalized)
  const canonicalKey = a.canonicalKey.length <= b.canonicalKey.length
    ? a.canonicalKey
    : b.canonicalKey
  
  // Merge aliases
  const aliases = [...new Set([...a.aliases, ...b.aliases])]
  
  // Merge mentions
  const mentions = [...a.mentions, ...b.mentions]
  
  // Regenerate slug from canonicalKey
  const slug = canonicalKey.replace(/_/g, '-').toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  return {
    canonicalName,
    canonicalKey,
    slug,
    aliases,
    mentions
  }
}

/**
 * Merge a list of entities
 */
export function mergeEntityList(entities: Entity[]): Entity[] {
  const merged: Entity[] = []
  const processed = new Set<number>()
  
  for (let i = 0; i < entities.length; i++) {
    if (processed.has(i)) continue
    
    let current = entities[i]
    processed.add(i)
    
    // Look for mergeable entities
    for (let j = i + 1; j < entities.length; j++) {
      if (processed.has(j)) continue
      
      if (shouldMerge(current, entities[j])) {
        current = mergeEntities(current, entities[j])
        processed.add(j)
      }
    }
    
    merged.push(current)
  }
  
  return merged
}

