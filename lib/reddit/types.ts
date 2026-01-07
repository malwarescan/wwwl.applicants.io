/**
 * Type definitions for Reddit extraction pipeline
 */

export type SourceRef = {
  permalink: string
  createdUtc: number
  author: string
  subreddit: string
  field: 'title' | 'selftext' | 'body' | 'url'
}

export type Evidence = {
  excerpt: string // max 240 chars
  match: string // the raw extracted string or matched phrase
  source: SourceRef
}

export type Candidate = {
  raw: string
  typeHint: 'org_name' | 'domain' | 'alias'
  confidence: number // 0..1
  evidence: Evidence[]
}

export type RedditThing = {
  kind?: string
  data: {
    title?: string
    selftext?: string
    body?: string
    url?: string
    permalink?: string
    created_utc?: number
    author?: string
    subreddit?: string
    [key: string]: any
  }
}

