/**
 * Main Pipeline Orchestrator
 * 
 * Coordinates the full extraction → normalization → scoring → gate pipeline
 */

import { extractCandidates } from '../reddit/extractCandidates'
import type { RedditThing } from '../reddit/types'
import { normalizeEntity } from '../entities/normalizeEntity'
import { mergeEntityList } from '../entities/mergeEntities'
import type { Entity } from '../entities/types'
import { scoreEntity } from '../scoring/scoreEntity'
import type { ScoreResult } from '../scoring/types'
import { shouldPublish } from '../publish/shouldPublish'
import type { PublishDecision } from '../publish/types'

export type PipelineResult = {
  candidates: Array<{
    raw: string
    typeHint: string
    confidence: number
    evidenceCount: number
  }>
  entities: Array<{
    canonicalName: string
    canonicalKey: string
    slug: string
    aliases: string[]
    mentionCount: number
  }>
  scored: Array<{
    entity: Entity
    score: ScoreResult
    publishDecision: PublishDecision
  }>
  summary: {
    totalCandidates: number
    totalEntities: number
    publishedCount: number
    watchlistCount: number
  }
}

/**
 * Run the complete pipeline
 */
export function runPipeline(
  redditThings: RedditThing[],
  existingEntities: Entity[] = []
): PipelineResult {
  // Step 1: Extract candidates
  const candidates = extractCandidates(redditThings)

  // Step 2: Normalize to entities
  const normalizedEntities = candidates.map(c => normalizeEntity(c))

  // Step 3: Merge duplicates
  const mergedEntities = mergeEntityList(normalizedEntities)

  // Step 4: Score entities
  const scored = mergedEntities.map(entity => {
    const score = scoreEntity(entity)
    const publishDecision = shouldPublish(entity, score, existingEntities)
    
    return {
      entity,
      score,
      publishDecision
    }
  })

  // Step 5: Summary
  const published = scored.filter(s => s.publishDecision.publish)
  const watchlist = scored.filter(s => !s.publishDecision.publish)

  return {
    candidates: candidates.map(c => ({
      raw: c.raw,
      typeHint: c.typeHint,
      confidence: c.confidence,
      evidenceCount: c.evidence.length
    })),
    entities: mergedEntities.map(e => ({
      canonicalName: e.canonicalName,
      canonicalKey: e.canonicalKey,
      slug: e.slug,
      aliases: e.aliases,
      mentionCount: e.mentions.length
    })),
    scored: scored.map(s => ({
      entity: s.entity,
      score: s.score,
      publishDecision: s.publishDecision
    })),
    summary: {
      totalCandidates: candidates.length,
      totalEntities: mergedEntities.length,
      publishedCount: published.length,
      watchlistCount: watchlist.length
    }
  }
}

