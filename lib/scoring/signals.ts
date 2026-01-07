/**
 * Signal Patterns and Weights
 * 
 * Defines the patterns that indicate DevilCorp-style recruiting
 */

import type { Evidence } from '../reddit/types'

export type SignalPattern = {
  id: string
  weight: number
  patterns: RegExp[]
  weakPatterns?: RegExp[] // Lower confidence patterns
}

export const SIGNALS: SignalPattern[] = [
  {
    id: 'COMMISSION_ONLY_LANGUAGE',
    weight: 1.1,
    patterns: [
      /\bcommission\s+only\b/i,
      /\b100%\s+commission\b/i,
      /\bno\s+base\s+pay\b/i,
      /\bno\s+base\s+salary\b/i,
      /\bno\s+hourly\s+wage\b/i
    ],
    weakPatterns: [
      /\buncapped\s+commission\b/i,
      /\bdraw\b/i
    ]
  },
  {
    id: 'UNPAID_TRAINING_OR_SHADOWING',
    weight: 1.0,
    patterns: [
      /\bunpaid\s+training\b/i,
      /\bshadowing\s+for\s+free\b/i,
      /\bno\s+pay\s+during\s+training\b/i,
      /\bunpaid\s+orientation\b/i,
      /\btraining\s+is\s+unpaid\b/i
    ]
  },
  {
    id: 'GROUP_INTERVIEW',
    weight: 0.9,
    patterns: [
      /\bgroup\s+interview\b/i,
      /\bmass\s+interview\b/i,
      /\beveryone\s+in\s+a\s+room\b/i,
      /\bcattle\s+call\b/i,
      /\broom\s+full\s+of\s+people\b/i
    ]
  },
  {
    id: 'SAME_DAY_OFFER',
    weight: 0.8,
    patterns: [
      /\bhired\s+on\s+the\s+spot\b/i,
      /\boffered\s+same\s+day\b/i,
      /\bimmediate\s+start\s+tomorrow\b/i,
      /\bhired\s+immediately\b/i,
      /\boffer\s+on\s+the\s+spot\b/i
    ]
  },
  {
    id: 'DOOR_TO_DOOR_OR_KIOSK',
    weight: 0.8,
    patterns: [
      /\bdoor\s+to\s+door\b/i,
      /\bcostco\s+kiosk\b/i,
      /\bsam['']?s\s+club\s+table\b/i,
      /\bb2c\s+booth\b/i,
      /\bselling\s+at\s+(?:costco|sam['']?s|walmart|target)\b/i
    ]
  },
  {
    id: 'REBRAND_DBA',
    weight: 1.2,
    patterns: [
      /\brebranded\b/i,
      /\bformerly\s+known\s+as\b/i,
      /\bd\/b\/a\b/i,
      /\bchanged\s+name\b/i,
      /\bdoing\s+business\s+as\b/i
    ]
  },
  {
    id: 'SEMINAR_CULT_LANGUAGE',
    weight: 0.7,
    patterns: [
      /\bowner\s+in\s+(?:6|12)\s+months\b/i,
      /\bmanagement\s+training\s+program\b/i,
      /\bleadership\s+conference\b/i,
      /\bpromote\s+to\s+manager\s+fast\b/i
    ]
  },
  {
    id: 'NETWORK_KEYWORDS_OVERLAP',
    weight: 0.6,
    patterns: [
      /\bsmart\s+circle\b/i,
      /\bcydcor\b/i,
      /\bappco\b/i,
      /\bcredico\b/i,
      /\bdevilcorp\b/i,
      /\bdevil\s+corp\b/i
    ]
  }
]

/**
 * Extract signals from evidence text
 */
export function extractSignals(evidence: Evidence[]): Array<{
  signalId: string
  weight: number
  evidence: Evidence
  isWeak: boolean
}> {
  const matches: Array<{
    signalId: string
    weight: number
    evidence: Evidence
    isWeak: boolean
  }> = []

  for (const ev of evidence) {
    const text = `${ev.excerpt} ${ev.match}`.toLowerCase()

    for (const signal of SIGNALS) {
      // Check strong patterns
      for (const pattern of signal.patterns) {
        if (pattern.test(text)) {
          matches.push({
            signalId: signal.id,
            weight: signal.weight,
            evidence: ev,
            isWeak: false
          })
          break // Only count once per signal per evidence
        }
      }

      // Check weak patterns if no strong match
      if (signal.weakPatterns && matches.length === 0) {
        for (const weakPattern of signal.weakPatterns) {
          if (weakPattern.test(text)) {
            matches.push({
              signalId: signal.id,
              weight: signal.weight * 0.7, // Reduce weight for weak matches
              evidence: ev,
              isWeak: true
            })
            break
          }
        }
      }
    }
  }

  return matches
}

