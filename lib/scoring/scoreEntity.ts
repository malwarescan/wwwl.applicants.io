/**
 * Risk Scoring Function
 * 
 * Mathematical risk scoring based on signal patterns
 */

import type { Entity } from '../entities/types'
import type { ScoreResult, SignalEvent } from './types'
import { extractSignals, SIGNALS } from './signals'

/**
 * Calculate consistency boost based on source diversity
 */
function calculateConsistencyBoost(evidence: Array<{ source: { subreddit: string; createdUtc: number } }>): number {
  // Count distinct subreddits
  const subreddits = new Set(evidence.map(e => e.source.subreddit))
  
  // Count distinct 30-day time buckets
  const timeBuckets = new Set(
    evidence.map(e => {
      const daysSinceEpoch = Math.floor(e.source.createdUtc / 86400)
      return Math.floor(daysSinceEpoch / 30)
    })
  )
  
  const s = subreddits.size + timeBuckets.size
  const c = Math.min(1, s / 3) // Caps at 1
  
  // Boost factor: 1 + 0.15 * c (up to +15%)
  return 1 + 0.15 * c
}

/**
 * Score an entity based on evidence
 */
export function scoreEntity(entity: Entity): ScoreResult {
  // Extract signals from evidence
  const signalMatches = extractSignals(entity.mentions)
  
  // Group by signal ID and calculate counts
  const signalCounts = new Map<string, number>()
  const signalEvents: SignalEvent[] = []
  
  for (const match of signalMatches) {
    const count = signalCounts.get(match.signalId) || 0
    signalCounts.set(match.signalId, count + 1)
    
    // Calculate contribution: w_i * log(1 + count)
    const currentCount = count + 1
    const x = Math.log(1 + currentCount)
    const contribution = match.weight * x
    
    signalEvents.push({
      signalId: match.signalId,
      weight: match.weight,
      contribution,
      evidence: match.evidence
    })
  }
  
  // Calculate weighted sum: z = b0 + Σ (w_i * x_i)
  const b0 = -1.2 // Base skepticism
  let z = b0
  
  const topSignals: Array<{
    signalId: string
    count: number
    weight: number
    contribution: number
  }> = []
  
  for (const [signalId, count] of signalCounts.entries()) {
    const signal = SIGNALS.find(s => s.id === signalId)
    if (!signal) continue
    
    const x = Math.log(1 + count)
    const contribution = signal.weight * x
    z += contribution
    
    topSignals.push({
      signalId,
      count,
      weight: signal.weight,
      contribution
    })
  }
  
  // Calculate raw probability: p = 1 / (1 + e^-z)
  const p = 1 / (1 + Math.exp(-z))
  
  // Base score: R0 = 100 * p
  let R0 = 100 * p
  
  // Consistency boost
  const boost = calculateConsistencyBoost(entity.mentions)
  R0 = R0 * boost
  
  // Clamp to [0, 100]
  const score = Math.max(0, Math.min(100, Math.round(R0)))
  
  // Sort top signals by contribution
  topSignals.sort((a, b) => b.contribution - a.contribution)
  
  // Sort signal events by contribution
  signalEvents.sort((a, b) => b.contribution - a.contribution)
  
  return {
    score,
    probability: p,
    topSignals: topSignals.slice(0, 10), // Top 10
    signalEvents: signalEvents.slice(0, 30) // Top 30 evidence items
  }
}

