/**
 * STEP 4: Publication Gate
 * 
 * Apply thresholds to determine if an entity should be published.
 * Only entities passing all gates become company pages.
 * 
 * Input: ScoredEntity[]
 * Output: PublicationReadyEntity[]
 */

import type { ScoredEntity, PublicationReadyEntity, ExtractionConfig } from './types'

/**
 * Check if entity meets all publication thresholds
 */
function meetsPublicationThresholds(
  entity: ScoredEntity,
  config: ExtractionConfig
): { approved: boolean; reason?: string } {
  const thresholds = config.step4.publication_thresholds

  // Check mention count
  if (entity.mention_count < thresholds.min_mention_count) {
    return {
      approved: false,
      reason: `Mention count ${entity.mention_count} below threshold ${thresholds.min_mention_count}`
    }
  }

  // Check pattern score
  if (entity.pattern_score.total < thresholds.min_pattern_score) {
    return {
      approved: false,
      reason: `Pattern score ${entity.pattern_score.total} below threshold ${thresholds.min_pattern_score}`
    }
  }

  // Check source type diversity
  if (entity.source_type_count < thresholds.min_source_types) {
    return {
      approved: false,
      reason: `Source types ${entity.source_type_count} below threshold ${thresholds.min_source_types}`
    }
  }

  // Check confidence
  if (entity.pattern_score.confidence < thresholds.min_confidence) {
    return {
      approved: false,
      reason: `Confidence ${entity.pattern_score.confidence} below threshold ${thresholds.min_confidence}`
    }
  }

  return { approved: true }
}

/**
 * Main Step 4 function: Apply publication gate
 */
export function applyPublicationGate(
  entities: ScoredEntity[],
  config: ExtractionConfig
): PublicationReadyEntity[] {
  const ready: PublicationReadyEntity[] = []

  for (const entity of entities) {
    const gateResult = meetsPublicationThresholds(entity, config)

    ready.push({
      ...entity,
      publication_status: gateResult.approved ? 'approved' : 'rejected',
      rejection_reason: gateResult.reason,
      approved_at: gateResult.approved ? new Date().toISOString() : undefined
    })
  }

  return ready
}

/**
 * Filter to only approved entities
 */
export function getApprovedEntities(
  entities: PublicationReadyEntity[]
): PublicationReadyEntity[] {
  return entities.filter(e => e.publication_status === 'approved')
}

