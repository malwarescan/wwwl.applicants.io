/**
 * Entity normalization types
 */

import type { Evidence } from '../reddit/types'

export type Entity = {
  canonicalName: string
  canonicalKey: string
  slug: string
  aliases: string[]
  mentions: Evidence[]
}

