/**
 * STEP 3: Pattern Scoring
 * 
 * Apply risk scoring dimensions to detect DevilCorp patterns.
 * This is where pattern indicators emerge, but still no labels.
 * 
 * Input: NormalizedEntity[]
 * Output: ScoredEntity[]
 */

import type { NormalizedEntity, ScoredEntity, RawCandidate, ExtractionConfig } from './types'

/**
 * Detect commission-only language in raw candidates
 */
function detectCommissionOnlyLanguage(candidates: RawCandidate[]): boolean {
  const commissionKeywords = [
    'commission only',
    'commission-based',
    '100% commission',
    'uncapped commission',
    'no base salary',
    'no hourly wage',
    'earn what you sell',
    'performance-based pay'
  ]

  const text = candidates
    .map(c => c.raw_string)
    .join(' ')
    .toLowerCase()

  return commissionKeywords.some(keyword => text.includes(keyword))
}

/**
 * Detect group interview mentions
 */
function detectGroupInterviewMentions(candidates: RawCandidate[]): boolean {
  const groupInterviewKeywords = [
    'group interview',
    'group orientation',
    'mass interview',
    'multiple candidates',
    'interviewed with others',
    'room full of people'
  ]

  // We'd need access to the full comment/post text, but for now
  // we'll check if any candidate has metadata suggesting this
  // In a real implementation, you'd search the original Reddit text
  return false // Placeholder - would need original text access
}

/**
 * Detect same-day offer mentions
 */
function detectSameDayOffers(candidates: RawCandidate[]): boolean {
  const sameDayKeywords = [
    'hired on the spot',
    'offer same day',
    'offered immediately',
    'started the next day',
    'hired immediately'
  ]

  // Placeholder - would need original text access
  return false
}

/**
 * Detect rebranding indicators
 */
function detectRebrandingIndicators(entity: NormalizedEntity): boolean {
  // Multiple aliases with different core names suggests rebranding
  if (entity.aliases.length >= 3) {
    const coreNames = new Set(
      entity.aliases.map(alias => {
        const parts = alias.split(/\s+/)
        return parts[0] // First word
      })
    )
    return coreNames.size >= 2
  }
  return false
}

/**
 * Extract shared addresses (placeholder - would need address extraction)
 */
function extractSharedAddresses(candidates: RawCandidate[]): string[] {
  // Placeholder - would need address extraction from text
  return []
}

/**
 * Detect network overlap (Smart Circle, Cydcor, Appco, etc.)
 */
function detectNetworkOverlap(candidates: RawCandidate[]): string[] {
  const networks = [
    'Smart Circle',
    'Cydcor',
    'Appco',
    'Synaptic',
    'DS-Max',
    'DevilCorp',
    'Devil Corp'
  ]

  const text = candidates
    .map(c => c.raw_string)
    .join(' ')
    .toLowerCase()

  const found: string[] = []
  for (const network of networks) {
    if (text.includes(network.toLowerCase())) {
      found.push(network)
    }
  }

  return found
}

/**
 * Score wage/payment dimension (0-100)
 */
function scoreWagePayment(candidates: RawCandidate[]): number {
  // Placeholder - would analyze text for payment complaints
  // For now, return based on commission-only detection
  if (detectCommissionOnlyLanguage(candidates)) {
    return 60 // Elevated risk
  }
  return 20 // Low risk
}

/**
 * Score misrepresentation dimension (0-100)
 */
function scoreMisrepresentation(candidates: RawCandidate[]): number {
  // Placeholder - would analyze text for "not what was advertised" patterns
  return 30 // Default moderate risk
}

/**
 * Score churn/pressure dimension (0-100)
 */
function scoreChurnPressure(candidates: RawCandidate[]): number {
  // Placeholder - would analyze text for high-pressure, burnout patterns
  return 25 // Default low-moderate risk
}

/**
 * Score recruitment funnel dimension (0-100)
 */
function scoreRecruitmentFunnel(candidates: RawCandidate[]): number {
  let score = 20 // Base

  if (detectGroupInterviewMentions(candidates)) {
    score += 30
  }

  if (detectSameDayOffers(candidates)) {
    score += 25
  }

  return Math.min(score, 100)
}

/**
 * Score legal threats dimension (0-100)
 */
function scoreLegalThreats(candidates: RawCandidate[]): number {
  // Placeholder - would search for legal threat mentions
  return 10 // Default low risk
}

/**
 * Score identity obfuscation dimension (0-100)
 */
function scoreIdentityObfuscation(entity: NormalizedEntity): number {
  let score = 20 // Base

  if (detectRebrandingIndicators(entity)) {
    score += 40
  }

  if (entity.aliases.length >= 5) {
    score += 20
  }

  return Math.min(score, 100)
}

/**
 * Score review pattern anomaly dimension (0-100)
 */
function scoreReviewPatternAnomaly(candidates: RawCandidate[]): number {
  // Placeholder - would analyze review clustering, astroturfing patterns
  return 15 // Default low risk
}

/**
 * Calculate total pattern score
 */
function calculateTotalScore(
  subscores: ScoredEntity['pattern_score']['subscores'],
  weights: ExtractionConfig['step3']['scoring_weights']
): number {
  return Math.round(
    weights.wage_payment * subscores.wage_payment +
    weights.misrepresentation * subscores.misrepresentation +
    weights.churn_pressure * subscores.churn_pressure +
    weights.recruitment_funnel * subscores.recruitment_funnel +
    weights.legal_threats * subscores.legal_threats +
    weights.identity_obfuscation * subscores.identity_obfuscation +
    weights.review_pattern_anomaly * subscores.review_pattern_anomaly
  )
}

/**
 * Calculate confidence score
 */
function calculateConfidence(entity: NormalizedEntity): number {
  // Based on mention count, source diversity, normalization confidence
  const mentionFactor = Math.min(entity.mention_count / 10, 1.0)
  const sourceFactor = entity.sources.length / 3 // Normalize to 0-1
  const normalizationFactor = entity.normalization_confidence

  return Math.min(
    (mentionFactor * 0.4 + sourceFactor * 0.3 + normalizationFactor * 0.3),
    1.0
  )
}

/**
 * Count unique source types
 */
function countSourceTypes(entity: NormalizedEntity): number {
  return entity.sources.length
}

/**
 * Main Step 3 function: Apply pattern scoring
 */
export function scorePatterns(
  entities: NormalizedEntity[],
  config: ExtractionConfig
): ScoredEntity[] {
  const scored: ScoredEntity[] = []

  for (const entity of entities) {
    const subscores = {
      wage_payment: scoreWagePayment(entity.raw_candidates),
      misrepresentation: scoreMisrepresentation(entity.raw_candidates),
      churn_pressure: scoreChurnPressure(entity.raw_candidates),
      recruitment_funnel: scoreRecruitmentFunnel(entity.raw_candidates),
      legal_threats: scoreLegalThreats(entity.raw_candidates),
      identity_obfuscation: scoreIdentityObfuscation(entity),
      review_pattern_anomaly: scoreReviewPatternAnomaly(entity.raw_candidates)
    }

    const total = calculateTotalScore(subscores, config.step3.scoring_weights)
    const confidence = calculateConfidence(entity)
    const sourceTypeCount = countSourceTypes(entity)

    const patternIndicators = {
      commission_only_language: detectCommissionOnlyLanguage(entity.raw_candidates),
      group_interview_mentions: detectGroupInterviewMentions(entity.raw_candidates),
      same_day_offers: detectSameDayOffers(entity.raw_candidates),
      rebranding_indicators: detectRebrandingIndicators(entity),
      shared_addresses: extractSharedAddresses(entity.raw_candidates),
      network_overlap: detectNetworkOverlap(entity.raw_candidates)
    }

    scored.push({
      ...entity,
      pattern_score: {
        total,
        confidence,
        subscores
      },
      pattern_indicators,
      evidence_count: entity.mention_count,
      source_type_count: sourceTypeCount
    })
  }

  return scored
}

