/**
 * STEP 1: Raw Intake
 * 
 * Extract candidates from Reddit JSON without interpretation.
 * No judgment. No labels. Just extraction.
 * 
 * Output: RawCandidate[]
 */

import type { RawCandidate, RedditThread, ExtractionConfig } from './types'

/**
 * Extract capitalized multi-word phrases that might be company names
 */
function extractCapitalizedPhrases(text: string): string[] {
  // Pattern: 2+ capitalized words in sequence
  // Excludes common sentence starters and proper nouns at start of sentences
  const pattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g
  const matches: string[] = []
  let match

  while ((match = pattern.exec(text)) !== null) {
    const phrase = match[1]
    // Filter out common false positives
    if (
      !phrase.match(/^(I|We|They|This|That|These|Those|Here|There|What|When|Where|Why|How)\s/i) &&
      phrase.split(/\s+/).length >= 2 &&
      phrase.length >= 4
    ) {
      matches.push(phrase)
    }
  }

  return [...new Set(matches)] // Deduplicate
}

/**
 * Extract URLs that look like company domains
 */
function extractCompanyDomains(text: string): string[] {
  const urlPattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)/g
  const domains: string[] = []
  let match

  while ((match = urlPattern.exec(text)) !== null) {
    const domain = match[1]
    // Filter out common non-company domains
    if (
      !domain.match(/^(reddit|imgur|youtube|twitter|x|facebook|instagram|linkedin|github|stackoverflow|amazon|google|microsoft)\./i) &&
      !domain.includes('redd.it') &&
      domain.split('.').length >= 2
    ) {
      domains.push(domain)
    }
  }

  return [...new Set(domains)]
}

/**
 * Extract LinkedIn company links
 */
function extractLinkedInLinks(text: string): Array<{ url: string; companyId?: string }> {
  const linkedinPattern = /https?:\/\/(?:www\.)?linkedin\.com\/company\/([a-zA-Z0-9-]+)/g
  const links: Array<{ url: string; companyId?: string }> = []
  let match

  while ((match = linkedinPattern.exec(text)) !== null) {
    links.push({
      url: match[0],
      companyId: match[1]
    })
  }

  return links
}

/**
 * Calculate confidence score for a raw candidate
 */
function calculateConfidence(
  extractionMethod: 'capitalized_phrase' | 'domain' | 'linkedin' | 'repeated_string',
  context: string,
  metadata?: RawCandidate['metadata']
): number {
  let baseConfidence = 0.3

  // Method-specific base confidence
  switch (extractionMethod) {
    case 'linkedin':
      baseConfidence = 0.8
      break
    case 'domain':
      baseConfidence = 0.6
      break
    case 'capitalized_phrase':
      baseConfidence = 0.4
      break
    case 'repeated_string':
      baseConfidence = 0.5
      break
  }

  // Context adjustments
  if (context === 'title' || context === 'company_page') {
    baseConfidence += 0.1
  }

  // Metadata adjustments
  if (metadata) {
    if (metadata.upvotes && metadata.upvotes > 10) {
      baseConfidence += 0.05
    }
    if (metadata.subreddit && metadata.subreddit.match(/jobs|careers|recruiting/i)) {
      baseConfidence += 0.05
    }
  }

  return Math.min(baseConfidence, 1.0)
}

/**
 * Main Step 1 function: Extract raw candidates from Reddit threads
 */
export function extractRawCandidates(
  threads: RedditThread[],
  config: ExtractionConfig
): RawCandidate[] {
  const candidates: RawCandidate[] = []
  const seen = new Set<string>()

  for (const thread of threads) {
    // Extract from post title and body
    const postText = `${thread.post.title} ${thread.post.selftext || ''}`

    // Extract capitalized phrases
    const phrases = extractCapitalizedPhrases(postText)
    for (const phrase of phrases) {
      const key = `phrase:${phrase.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        candidates.push({
          raw_string: phrase,
          source: 'reddit',
          context: 'title',
          thread: thread.post.id,
          url: `https://reddit.com${thread.post.permalink}`,
          confidence: calculateConfidence('capitalized_phrase', 'title', {
            subreddit: thread.post.subreddit,
            author: thread.post.author,
            upvotes: thread.post.score
          }),
          extracted_at: new Date().toISOString(),
          metadata: {
            subreddit: thread.post.subreddit,
            author: thread.post.author,
            upvotes: thread.post.score
          }
        })
      }
    }

    // Extract domains
    const domains = extractCompanyDomains(postText)
    for (const domain of domains) {
      const key = `domain:${domain.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        candidates.push({
          raw_string: domain,
          source: 'reddit',
          context: 'url',
          thread: thread.post.id,
          url: `https://reddit.com${thread.post.permalink}`,
          confidence: calculateConfidence('domain', 'url', {
            subreddit: thread.post.subreddit,
            author: thread.post.author,
            upvotes: thread.post.score,
            domain
          }),
          extracted_at: new Date().toISOString(),
          metadata: {
            subreddit: thread.post.subreddit,
            author: thread.post.author,
            upvotes: thread.post.score,
            domain
          }
        })
      }
    }

    // Extract LinkedIn links
    const linkedinLinks = extractLinkedInLinks(postText)
    for (const link of linkedinLinks) {
      const key = `linkedin:${link.companyId?.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        candidates.push({
          raw_string: link.companyId || link.url,
          source: 'reddit',
          context: 'url',
          thread: thread.post.id,
          url: `https://reddit.com${thread.post.permalink}`,
          confidence: calculateConfidence('linkedin', 'url', {
            subreddit: thread.post.subreddit,
            author: thread.post.author,
            upvotes: thread.post.score,
            linkedin_company_id: link.companyId
          }),
          extracted_at: new Date().toISOString(),
          metadata: {
            subreddit: thread.post.subreddit,
            author: thread.post.author,
            upvotes: thread.post.score,
            linkedin_company_id: link.companyId
          }
        })
      }
    }

    // Extract from comments
    for (const comment of thread.comments) {
      const commentText = comment.body

      // Extract capitalized phrases from comments
      const commentPhrases = extractCapitalizedPhrases(commentText)
      for (const phrase of commentPhrases) {
        const key = `phrase:${phrase.toLowerCase()}:${comment.id}`
        if (!seen.has(key)) {
          seen.add(key)
          candidates.push({
            raw_string: phrase,
            source: 'reddit',
            context: 'comment',
            thread: thread.post.id,
            url: `https://reddit.com${thread.post.permalink}`,
            confidence: calculateConfidence('capitalized_phrase', 'comment', {
              subreddit: thread.post.subreddit,
              author: comment.author,
              upvotes: comment.score
            }),
            extracted_at: new Date().toISOString(),
            metadata: {
              subreddit: thread.post.subreddit,
              author: comment.author,
              upvotes: comment.score
            }
          })
        }
      }

      // Extract domains from comments
      const commentDomains = extractCompanyDomains(commentText)
      for (const domain of commentDomains) {
        const key = `domain:${domain.toLowerCase()}:${comment.id}`
        if (!seen.has(key)) {
          seen.add(key)
          candidates.push({
            raw_string: domain,
            source: 'reddit',
            context: 'comment',
            thread: thread.post.id,
            url: `https://reddit.com${thread.post.permalink}`,
            confidence: calculateConfidence('domain', 'comment', {
              subreddit: thread.post.subreddit,
              author: comment.author,
              upvotes: comment.score,
              domain
            }),
            extracted_at: new Date().toISOString(),
            metadata: {
              subreddit: thread.post.subreddit,
              author: comment.author,
              upvotes: comment.score,
              domain
            }
          })
        }
      }
    }
  }

  // Filter by minimum confidence
  return candidates.filter(c => c.confidence >= config.step1.min_confidence)
}

