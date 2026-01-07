/**
 * Publication State Utilities
 */

import type { PublishState } from './types'

/**
 * Get display label for publish state
 */
export function getPublishStateLabel(state: PublishState): string {
  switch (state) {
    case 'WATCHLIST':
      return 'Watchlist (Not Public)'
    case 'PUBLIC_LOW':
      return 'Public - Low Risk'
    case 'PUBLIC_MED':
      return 'Public - Medium Risk'
    case 'PUBLIC_HIGH':
      return 'Public - High Risk'
  }
}

/**
 * Check if state is public
 */
export function isPublicState(state: PublishState): boolean {
  return state !== 'WATCHLIST'
}

