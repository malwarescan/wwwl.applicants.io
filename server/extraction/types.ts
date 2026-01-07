/**
 * Extraction Pipeline Type Definitions
 * 
 * These types define the data structures that flow through the 4-step
 * extraction pipeline from Reddit JSON to published company pages.
 */

/**
 * STEP 1 OUTPUT: Raw candidate extraction
 * No interpretation, no labels, just extracted strings with metadata
 */
export interface RawCandidate {
  raw_string: string
  source: 'reddit' | 'linkedin' | 'job_board' | 'screenshot' | 'other'
  context: 'comment' | 'post' | 'title' | 'url' | 'company_page' | 'other'
  thread?: string // Reddit thread ID
  url?: string // Source URL if available
  confidence: number // 0.0-1.0, based on extraction method reliability
  extracted_at: string // ISO 8601 timestamp
  metadata?: {
    subreddit?: string
    author?: string
    upvotes?: number
    domain?: string
    linkedin_company_id?: string
  }
}

/**
 * STEP 2 OUTPUT: Normalized entity candidate
 * Machine-safe normalization, still no judgment
 */
export interface NormalizedEntity {
  canonical_name: string
  aliases: string[]
  sources: Array<'reddit' | 'linkedin' | 'job_board' | 'opencorporates' | 'other'>
  mention_count: number
  raw_candidates: RawCandidate[] // References back to Step 1
  normalization_confidence: number // 0.0-1.0
  potential_matches?: Array<{
    name: string
    source: 'opencorporates' | 'linkedin' | 'job_board'
    match_score: number
    url?: string
  }>
}

/**
 * STEP 3 OUTPUT: Pattern-scored entity
 * Risk scoring applied, but still not published
 */
export interface ScoredEntity extends NormalizedEntity {
  pattern_score: {
    total: number // 0-100
    confidence: number // 0.0-1.0
    subscores: {
      wage_payment: number // 0-100
      misrepresentation: number // 0-100
      churn_pressure: number // 0-100
      recruitment_funnel: number // 0-100
      legal_threats: number // 0-100
      identity_obfuscation: number // 0-100
      review_pattern_anomaly: number // 0-100
    }
  }
  pattern_indicators: {
    commission_only_language: boolean
    group_interview_mentions: boolean
    same_day_offers: boolean
    rebranding_indicators: boolean
    shared_addresses: string[]
    network_overlap: string[] // e.g., ['Smart Circle', 'Cydcor', 'Appco']
  }
  evidence_count: number
  source_type_count: number // How many different source types
}

/**
 * STEP 4 OUTPUT: Publication-ready entity
 * Passed all gates, ready for company page generation
 */
export interface PublicationReadyEntity extends ScoredEntity {
  publication_status: 'approved' | 'pending' | 'rejected'
  rejection_reason?: string
  approved_at?: string // ISO 8601 timestamp
}

/**
 * Reddit JSON structure (simplified)
 * Adjust based on actual Reddit API response format
 */
export interface RedditPost {
  id: string
  title: string
  selftext?: string
  author: string
  subreddit: string
  score: number
  created_utc: number
  url: string
  permalink: string
}

export interface RedditComment {
  id: string
  body: string
  author: string
  score: number
  created_utc: number
  link_id: string // References parent post
  parent_id?: string
}

export interface RedditThread {
  post: RedditPost
  comments: RedditComment[]
}

/**
 * Pipeline configuration
 */
export interface ExtractionConfig {
  step1: {
    min_confidence: number // Minimum confidence to include raw candidate
    organization_patterns: RegExp[]
    domain_patterns: RegExp[]
  }
  step2: {
    normalization_rules: {
      strip_suffixes: string[] // ['Inc', 'LLC', 'Marketing', 'Group']
      min_mention_count: number
    }
  }
  step3: {
    scoring_weights: {
      wage_payment: number
      misrepresentation: number
      churn_pressure: number
      recruitment_funnel: number
      legal_threats: number
      identity_obfuscation: number
      review_pattern_anomaly: number
    }
  }
  step4: {
    publication_thresholds: {
      min_mention_count: number
      min_pattern_score: number
      min_source_types: number
      min_confidence: number
    }
  }
}

