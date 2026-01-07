/**
 * Extraction Pipeline Orchestrator
 * 
 * Coordinates the 4-step extraction process:
 * 1. Raw intake
 * 2. Entity normalization
 * 3. Pattern scoring
 * 4. Publication gate
 * 
 * This is the main entry point for processing Reddit JSON into
 * publication-ready company entities.
 */

import type {
  RedditThread,
  RawCandidate,
  NormalizedEntity,
  ScoredEntity,
  PublicationReadyEntity,
  ExtractionConfig
} from './types'

import { extractRawCandidates } from './step1-raw-intake'
import { normalizeEntities } from './step2-entity-normalization'
import { scorePatterns } from './step3-pattern-scoring'
import { applyPublicationGate, getApprovedEntities } from './step4-publication-gate'

/**
 * Default extraction configuration
 */
export const defaultConfig: ExtractionConfig = {
  step1: {
    min_confidence: 0.3,
    organization_patterns: [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g // Capitalized multi-word phrases
    ],
    domain_patterns: [
      /https?:\/\/(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)/g
    ]
  },
  step2: {
    normalization_rules: {
      strip_suffixes: ['Inc', 'LLC', 'Marketing', 'Group', 'Corp', 'Corporation', 'Ltd', 'Limited'],
      min_mention_count: 2
    }
  },
  step3: {
    scoring_weights: {
      wage_payment: 0.20,
      misrepresentation: 0.18,
      churn_pressure: 0.14,
      recruitment_funnel: 0.14,
      legal_threats: 0.10,
      identity_obfuscation: 0.12,
      review_pattern_anomaly: 0.12
    }
  },
  step4: {
    publication_thresholds: {
      min_mention_count: 5,
      min_pattern_score: 40,
      min_source_types: 2,
      min_confidence: 0.5
    }
  }
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  step1: {
    rawCandidates: RawCandidate[]
    count: number
  }
  step2: {
    normalizedEntities: NormalizedEntity[]
    count: number
  }
  step3: {
    scoredEntities: ScoredEntity[]
    count: number
  }
  step4: {
    publicationReady: PublicationReadyEntity[]
    approved: PublicationReadyEntity[]
    rejected: PublicationReadyEntity[]
    counts: {
      total: number
      approved: number
      rejected: number
    }
  }
  summary: {
    inputThreads: number
    outputApproved: number
    processingTime: number
  }
}

/**
 * Main pipeline function
 */
export async function runExtractionPipeline(
  threads: RedditThread[],
  config: ExtractionConfig = defaultConfig
): Promise<PipelineResult> {
  const startTime = Date.now()

  // STEP 1: Raw intake
  const rawCandidates = extractRawCandidates(threads, config)

  // STEP 2: Entity normalization
  const normalizedEntities = normalizeEntities(rawCandidates, config)

  // STEP 3: Pattern scoring
  const scoredEntities = scorePatterns(normalizedEntities, config)

  // STEP 4: Publication gate
  const publicationReady = applyPublicationGate(scoredEntities, config)
  const approved = getApprovedEntities(publicationReady)
  const rejected = publicationReady.filter(e => e.publication_status === 'rejected')

  const processingTime = Date.now() - startTime

  return {
    step1: {
      rawCandidates,
      count: rawCandidates.length
    },
    step2: {
      normalizedEntities,
      count: normalizedEntities.length
    },
    step3: {
      scoredEntities,
      count: scoredEntities.length
    },
    step4: {
      publicationReady,
      approved,
      rejected,
      counts: {
        total: publicationReady.length,
        approved: approved.length,
        rejected: rejected.length
      }
    },
    summary: {
      inputThreads: threads.length,
      outputApproved: approved.length,
      processingTime
    }
  }
}

/**
 * Generate safe publication language for approved entities
 * 
 * This function creates the non-accusatory language that should
 * appear on company pages, following the user's guidance:
 * "This company has been reported in multiple public sources to share
 * characteristics commonly associated with high-churn, commission-based
 * recruiting organizations."
 */
export function generatePublicationLanguage(entity: PublicationReadyEntity): {
  overview: string
  riskSummary: string
  disclaimer: string
} {
  const { canonical_name, pattern_score, pattern_indicators, mention_count, source_type_count } = entity

  const overview = `${canonical_name} has been mentioned in ${mention_count} public sources across ${source_type_count} different platforms.`

  const riskFactors: string[] = []
  if (pattern_indicators.commission_only_language) {
    riskFactors.push('commission-based compensation structures')
  }
  if (pattern_indicators.group_interview_mentions) {
    riskFactors.push('group interview processes')
  }
  if (pattern_indicators.same_day_offers) {
    riskFactors.push('rapid hiring processes')
  }
  if (pattern_indicators.rebranding_indicators) {
    riskFactors.push('multiple operating names')
  }
  if (pattern_indicators.network_overlap.length > 0) {
    riskFactors.push(`associations with known recruiting networks`)
  }

  const riskSummary = riskFactors.length > 0
    ? `Reports indicate patterns commonly associated with ${riskFactors.join(', ')}.`
    : `Reports indicate patterns that warrant further investigation.`

  const disclaimer = `This assessment is based on aggregated public reports and pattern analysis. Individual experiences may vary. This information is provided for educational purposes only and does not constitute legal advice or accusations.`

  return {
    overview,
    riskSummary,
    disclaimer
  }
}

