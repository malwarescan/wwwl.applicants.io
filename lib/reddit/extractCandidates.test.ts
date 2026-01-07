/**
 * Unit tests for Reddit candidate extraction
 */

import { describe, it, expect } from 'vitest'
import { extractCandidates } from './extractCandidates'
import type { RedditThing } from './types'

describe('extractCandidates', () => {
  it('should extract organization names from title', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'Has anyone worked for Valore Events Inc?',
          permalink: '/r/jobs/comments/abc123/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    expect(candidates.length).toBeGreaterThan(0)
    const valoreCandidate = candidates.find(c => c.raw.toLowerCase().includes('valore'))
    expect(valoreCandidate).toBeDefined()
    expect(valoreCandidate?.typeHint).toBe('org_name')
    expect(valoreCandidate?.evidence.length).toBeGreaterThan(0)
  })

  it('should extract aliases from "formerly known as" patterns', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'Company formerly known as Synaxus Marketing',
          selftext: 'They rebranded as Synaxus Solutions',
          permalink: '/r/jobs/comments/def456/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const synaxusCandidates = candidates.filter(c => 
      c.raw.toLowerCase().includes('synaxus')
    )
    expect(synaxusCandidates.length).toBeGreaterThan(0)
  })

  it('should extract domains from URLs', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'Check out https://valoreevents.com',
          permalink: '/r/jobs/comments/ghi789/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const valoreCandidate = candidates.find(c => 
      c.raw.toLowerCase().includes('valore') || 
      c.typeHint === 'domain'
    )
    expect(valoreCandidate).toBeDefined()
  })

  it('should exclude person names without org context', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'John Smith is hiring',
          permalink: '/r/jobs/comments/jkl012/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const johnSmith = candidates.find(c => 
      c.raw.toLowerCase().includes('john') && 
      c.raw.toLowerCase().includes('smith')
    )
    expect(johnSmith).toBeUndefined()
  })

  it('should include person names with org suffix', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'John Smith Inc is hiring',
          permalink: '/r/jobs/comments/mno345/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const johnSmithInc = candidates.find(c => 
      c.raw.toLowerCase().includes('john') && 
      c.raw.toLowerCase().includes('smith')
    )
    expect(johnSmithInc).toBeDefined()
  })

  it('should exclude common false positives', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'This is a test post about Monday morning meetings',
          permalink: '/r/jobs/comments/pqr678/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const mondayCandidate = candidates.find(c => 
      c.raw.toLowerCase().includes('monday')
    )
    expect(mondayCandidate).toBeUndefined()
  })

  it('should merge duplicate candidates from same source', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'Valore Events is hiring',
          selftext: 'Valore Events Inc has openings',
          permalink: '/r/jobs/comments/stu901/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const valoreCandidates = candidates.filter(c => 
      c.raw.toLowerCase().includes('valore')
    )
    
    // Should merge into one candidate with multiple evidence
    const mainCandidate = valoreCandidates.find(c => 
      c.evidence.length > 1
    )
    expect(mainCandidate).toBeDefined()
  })

  it('should be deterministic - same input produces same output', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'Valore Events Inc is a company',
          permalink: '/r/jobs/comments/vwx234/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const result1 = extractCandidates(things)
    const result2 = extractCandidates(things)

    expect(result1.length).toBe(result2.length)
    expect(result1.map(c => c.raw)).toEqual(result2.map(c => c.raw))
  })

  it('should extract from comments', () => {
    const things: RedditThing[] = [
      {
        data: {
          title: 'Job posting question',
          body: 'I worked for Valore Events and it was commission only',
          permalink: '/r/jobs/comments/xyz567/',
          created_utc: 1234567890,
          author: 'testuser',
          subreddit: 'jobs'
        }
      }
    ]

    const candidates = extractCandidates(things)

    const valoreCandidate = candidates.find(c => 
      c.raw.toLowerCase().includes('valore')
    )
    expect(valoreCandidate).toBeDefined()
    expect(valoreCandidate?.evidence[0]?.source.field).toBe('body')
  })
})

