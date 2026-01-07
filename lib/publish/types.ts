/**
 * Publication gate types
 */

export type PublishState = 'WATCHLIST' | 'PUBLIC_LOW' | 'PUBLIC_MED' | 'PUBLIC_HIGH'

export type PublishDecision = {
  publish: boolean
  state: PublishState
  reasons: string[]
}

