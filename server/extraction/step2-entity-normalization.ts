/**
 * STEP 2: Entity Normalization
 * 
 * Normalize raw candidates to canonical names.
 * Machine-safe normalization, still no judgment.
 * 
 * Input: RawCandidate[]
 * Output: NormalizedEntity[]
 */

import type { RawCandidate, NormalizedEntity, ExtractionConfig } from './types'

/**
 * Normalize a raw string by stripping common suffixes and cleaning
 */
function normalizeString(raw: string, stripSuffixes: string[]): string {
  let normalized = raw.trim()

  // Remove common suffixes (case-insensitive)
  for (const suffix of stripSuffixes) {
    const regex = new RegExp(`\\s+${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.?$`, 'i')
    normalized = normalized.replace(regex, '')
  }

  // Remove trailing punctuation
  normalized = normalized.replace(/[.,;:!?]+$/, '')

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim()

  return normalized
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.8

  // Simple word overlap
  const words1 = new Set(s1.split(/\s+/))
  const words2 = new Set(s2.split(/\s+/))
  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

/**
 * Group raw candidates by similarity
 */
function groupSimilarCandidates(
  candidates: RawCandidate[],
  stripSuffixes: string[],
  similarityThreshold = 0.7
): Array<RawCandidate[]> {
  const groups: Array<RawCandidate[]> = []
  const processed = new Set<number>()

  for (let i = 0; i < candidates.length; i++) {
    if (processed.has(i)) continue

    const group: RawCandidate[] = [candidates[i]]
    processed.add(i)

    const normalized1 = normalizeString(candidates[i].raw_string, stripSuffixes)

    for (let j = i + 1; j < candidates.length; j++) {
      if (processed.has(j)) continue

      const normalized2 = normalizeString(candidates[j].raw_string, stripSuffixes)
      const similarity = stringSimilarity(normalized1, normalized2)

      if (similarity >= similarityThreshold) {
        group.push(candidates[j])
        processed.add(j)
      }
    }

    groups.push(group)
  }

  return groups
}

/**
 * Select canonical name from a group of similar candidates
 * Prefers: LinkedIn IDs > domains > longer names > higher confidence
 */
function selectCanonicalName(group: RawCandidate[]): string {
  // Prefer LinkedIn company IDs
  const linkedinCandidate = group.find(c => c.metadata?.linkedin_company_id)
  if (linkedinCandidate?.metadata?.linkedin_company_id) {
    return linkedinCandidate.metadata.linkedin_company_id
  }

  // Prefer domain-based names
  const domainCandidate = group.find(c => c.metadata?.domain)
  if (domainCandidate?.metadata?.domain) {
    // Extract company name from domain (remove TLD, www, etc.)
    const domain = domainCandidate.metadata.domain
    const parts = domain.split('.')
    if (parts.length >= 2) {
      return parts[parts.length - 2] // Second-to-last part (e.g., "company" from "company.com")
    }
  }

  // Prefer longer, more complete names
  const sorted = [...group].sort((a, b) => {
    if (a.raw_string.length !== b.raw_string.length) {
      return b.raw_string.length - a.raw_string.length
    }
    return b.confidence - a.confidence
  })

  return sorted[0].raw_string
}

/**
 * Collect all aliases from a group
 */
function collectAliases(group: RawCandidate[], canonicalName: string, stripSuffixes: string[]): string[] {
  const aliases = new Set<string>()

  for (const candidate of group) {
    const normalized = normalizeString(candidate.raw_string, stripSuffixes)
    if (normalized.toLowerCase() !== canonicalName.toLowerCase()) {
      aliases.add(candidate.raw_string)
    }
  }

  return Array.from(aliases)
}

/**
 * Collect unique source types
 */
function collectSourceTypes(group: RawCandidate[]): Array<'reddit' | 'linkedin' | 'job_board' | 'opencorporates' | 'other'> {
  const sources = new Set<RawCandidate['source']>()
  for (const candidate of group) {
    sources.add(candidate.source)
  }

  // Map to normalized source types
  const mapped: Array<'reddit' | 'linkedin' | 'job_board' | 'opencorporates' | 'other'> = []
  for (const source of sources) {
    if (source === 'reddit') mapped.push('reddit')
    else if (source === 'linkedin') mapped.push('linkedin')
    else if (source === 'job_board') mapped.push('job_board')
    else mapped.push('other')
  }

  return mapped
}

/**
 * Calculate normalization confidence
 */
function calculateNormalizationConfidence(
  group: RawCandidate[],
  canonicalName: string
): number {
  // Base confidence from raw candidate confidences
  const avgConfidence = group.reduce((sum, c) => sum + c.confidence, 0) / group.length

  // Boost if we have multiple mentions
  const mentionBoost = Math.min(group.length / 10, 0.2)

  // Boost if we have LinkedIn or domain data
  const dataBoost = group.some(c => c.metadata?.linkedin_company_id || c.metadata?.domain) ? 0.1 : 0

  return Math.min(avgConfidence + mentionBoost + dataBoost, 1.0)
}

/**
 * Main Step 2 function: Normalize raw candidates to entities
 */
export function normalizeEntities(
  candidates: RawCandidate[],
  config: ExtractionConfig
): NormalizedEntity[] {
  // Filter by minimum mention count (if configured)
  const candidateCounts = new Map<string, number>()
  for (const candidate of candidates) {
    const key = candidate.raw_string.toLowerCase()
    candidateCounts.set(key, (candidateCounts.get(key) || 0) + 1)
  }

  const filteredCandidates = candidates.filter(c => {
    const count = candidateCounts.get(c.raw_string.toLowerCase()) || 0
    return count >= config.step2.normalization_rules.min_mention_count
  })

  // Group similar candidates
  const groups = groupSimilarCandidates(
    filteredCandidates,
    config.step2.normalization_rules.strip_suffixes
  )

  // Convert groups to normalized entities
  const entities: NormalizedEntity[] = []

  for (const group of groups) {
    const canonicalName = selectCanonicalName(group)
    const aliases = collectAliases(group, canonicalName, config.step2.normalization_rules.strip_suffixes)
    const sources = collectSourceTypes(group)
    const normalizationConfidence = calculateNormalizationConfidence(group, canonicalName)

    entities.push({
      canonical_name: canonicalName,
      aliases,
      sources,
      mention_count: group.length,
      raw_candidates: group,
      normalization_confidence: normalizationConfidence
    })
  }

  return entities
}

