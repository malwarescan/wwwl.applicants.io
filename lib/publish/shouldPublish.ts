/**
 * Publication Gate
 * 
 * Determines when a company page should be published
 */

import type { Entity } from '../entities/types'
import type { ScoreResult } from '../scoring/types'
import type { PublishDecision, PublishState } from './types'

/**
 * Calculate Jaccard similarity of token sets (helper function)
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
 * Calculate unique mentions (distinct permalink + author pairs)
 */
function countUniqueMentions(entity: Entity): number {
  const unique = new Set(
    entity.mentions.map(m => `${m.source.permalink}:${m.source.author}`)
  )
  return unique.size
}

/**
 * Count distinct threads (by permalink)
 */
function countDistinctThreads(entity: Entity): number {
  const threads = new Set(entity.mentions.map(m => m.source.permalink))
  return threads.size
}

/**
 * Count distinct authors
 */
function countDistinctAuthors(entity: Entity): number {
  const authors = new Set(entity.mentions.map(m => m.source.author))
  return authors.size
}

/**
 * Calculate time span in days
 */
function calculateTimeSpanDays(entity: Entity): number {
  if (entity.mentions.length === 0) return 0
  
  const timestamps = entity.mentions.map(m => m.source.createdUtc)
  const min = Math.min(...timestamps)
  const max = Math.max(...timestamps)
  
  return Math.floor((max - min) / 86400) // Convert seconds to days
}

/**
 * Count distinct subreddits
 */
function countDistinctSubreddits(entity: Entity): number {
  const subreddits = new Set(entity.mentions.map(m => m.source.subreddit))
  return subreddits.size
}

/**
 * Count distinct signal IDs from score result
 */
function countDistinctSignals(scoreResult: ScoreResult): number {
  return new Set(scoreResult.topSignals.map(s => s.signalId)).size
}

/**
 * Check name clarity
 */
function hasNameClarity(entity: Entity): boolean {
  const tokens = entity.canonicalKey.split('_').filter(t => t.length > 0)
  
  // Must have at least 2 tokens OR include corporate suffix in aliases
  if (tokens.length >= 2) {
    return true
  }
  
  // Check if any alias has corporate suffix
  const hasSuffix = entity.aliases.some(alias => 
    /\b(inc|llc|ltd|co|corp|corporation|company)\b/i.test(alias)
  )
  
  return hasSuffix
}

/**
 * Check for collisions with other entities
 */
function hasCollision(entity: Entity, otherEntities: Entity[]): boolean {
  for (const other of otherEntities) {
    if (other.canonicalKey === entity.canonicalKey) {
      continue // Same entity
    }
    
    const similarity = jaccardSimilarity(entity.canonicalKey, other.canonicalKey)
    if (similarity >= 0.9) {
      return true // Potential collision
    }
  }
  
  return false
}

/**
 * Determine if entity should be published
 */
export function shouldPublish(
  entity: Entity,
  scoreResult: ScoreResult,
  otherEntities: Entity[] = []
): PublishDecision {
  const reasons: string[] = []
  let passes = true

  // G1: Minimum mention volume
  const uniqueMentions = countUniqueMentions(entity)
  if (uniqueMentions < 5) {
    reasons.push(`Unique mentions (${uniqueMentions}) below threshold (5)`)
    passes = false
  }

  // G2: Minimum evidence diversity
  const distinctThreads = countDistinctThreads(entity)
  const distinctAuthors = countDistinctAuthors(entity)
  
  if (distinctThreads < 2) {
    reasons.push(`Distinct threads (${distinctThreads}) below threshold (2)`)
    passes = false
  }
  
  if (distinctAuthors < 3) {
    reasons.push(`Distinct authors (${distinctAuthors}) below threshold (3)`)
    passes = false
  }

  // G3: Time or cross-source spread
  const timeSpanDays = calculateTimeSpanDays(entity)
  const distinctSubreddits = countDistinctSubreddits(entity)
  
  if (timeSpanDays < 30 && distinctSubreddits < 2) {
    reasons.push(`Time span (${timeSpanDays} days) and subreddits (${distinctSubreddits}) both below thresholds`)
    passes = false
  }

  // G4: Minimum risk signal strength
  if (scoreResult.score < 55) {
    reasons.push(`Risk score (${scoreResult.score}) below threshold (55)`)
    passes = false
  }
  
  const distinctSignals = countDistinctSignals(scoreResult)
  if (distinctSignals < 2) {
    reasons.push(`Distinct signals (${distinctSignals}) below threshold (2)`)
    passes = false
  }

  // G5: Name clarity / anti-collision
  if (!hasNameClarity(entity)) {
    reasons.push(`Name clarity insufficient (token count < 2 and no corporate suffix)`)
    passes = false
  }
  
  if (hasCollision(entity, otherEntities)) {
    reasons.push(`Potential collision with existing entity detected`)
    // Collision doesn't necessarily block, but should be reviewed
    // For now, we'll allow but flag it
  }

  // Determine publish state
  let state: PublishState = 'WATCHLIST'
  
  if (passes) {
    if (scoreResult.score >= 85) {
      state = 'PUBLIC_HIGH'
    } else if (scoreResult.score >= 70) {
      state = 'PUBLIC_MED'
    } else {
      state = 'PUBLIC_LOW'
    }
  }

  return {
    publish: passes,
    state,
    reasons
  }
}

