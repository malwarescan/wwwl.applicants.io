/**
 * Scoring types
 */

import type { Evidence } from '../reddit/types'

export type SignalEvent = {
  signalId: string
  weight: number
  contribution: number
  evidence: Evidence
}

export type ScoreResult = {
  score: number // 0..100
  probability: number // 0..1
  topSignals: Array<{
    signalId: string
    count: number
    weight: number
    contribution: number
  }>
  signalEvents: SignalEvent[]
}

