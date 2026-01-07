/**
 * Reddit JSON Candidate Extraction
 * 
 * Extracts candidate organization names from Reddit posts/comments
 * without making any claims about what they represent.
 */

import type { Candidate, Evidence, SourceRef, RedditThing } from './types'

/**
 * Extract organization name candidates from text
 */
function extractOrgCandidatesFromText(
  text: string,
  sourceRef: SourceRef
): Candidate[] {
  const candidates: Candidate[] = []
  const seen = new Set<string>()

  // Multi-word proper-noun phrases (2-6 tokens) with TitleCase patterns
  const titleCasePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5})\b/g
  let match

  while ((match = titleCasePattern.exec(text)) !== null) {
    const phrase = match[1]
    const lowerPhrase = phrase.toLowerCase()

    // Skip if already seen
    if (seen.has(lowerPhrase)) continue

    // Exclude common false positives
    if (
      phrase.match(/^(I|We|They|This|That|These|Those|Here|There|What|When|Where|Why|How|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\s/i)
    ) {
      continue
    }

    // Check if adjacent to org suffix or keywords
    const before = text.substring(Math.max(0, match.index - 20), match.index)
    const after = text.substring(match.index + match[0].length, match.index + match[0].length + 20)
    const context = (before + ' ' + after).toLowerCase()

    const hasOrgSuffix = /\b(inc|llc|ltd|co|corp|corporation|company|group|marketing|events|solutions|consulting|international)\b/i.test(context)

    // Skip person names unless adjacent to org suffix
    if (!hasOrgSuffix && phrase.split(/\s+/).length === 2) {
      // Might be a person name - check if it looks like first+last
      const tokens = phrase.split(/\s+/)
      if (tokens[0].length <= 8 && tokens[1].length <= 12) {
        continue // Likely person name
      }
    }

    seen.add(lowerPhrase)

    const excerpt = extractExcerpt(text, match.index, 240)
    const evidence: Evidence = {
      excerpt,
      match: phrase,
      source: sourceRef
    }

    candidates.push({
      raw: phrase,
      typeHint: 'org_name',
      confidence: hasOrgSuffix ? 0.7 : 0.5,
      evidence: [evidence]
    })
  }

  // All-caps acronyms (2-6 chars) only if adjacent to org keywords
  const acronymPattern = /\b([A-Z]{2,6})\b/g
  while ((match = acronymPattern.exec(text)) !== null) {
    const acronym = match[1]
    const lowerAcronym = acronym.toLowerCase()

    if (seen.has(lowerAcronym)) continue

    // Check context for org keywords
    const before = text.substring(Math.max(0, match.index - 30), match.index)
    const after = text.substring(match.index + match[0].length, match.index + match[0].length + 30)
    const context = (before + ' ' + after).toLowerCase()

    const hasOrgKeyword = /\b(inc|llc|ltd|co|corp|corporation|company|group|marketing|events|solutions|consulting|international|incorporated)\b/i.test(context)

    if (!hasOrgKeyword) continue

    seen.add(lowerAcronym)

    const excerpt = extractExcerpt(text, match.index, 240)
    const evidence: Evidence = {
      excerpt,
      match: acronym,
      source: sourceRef
    }

    candidates.push({
      raw: acronym,
      typeHint: 'org_name',
      confidence: 0.6,
      evidence: [evidence]
    })
  }

  // "doing business as", "d/b/a", "aka", "formerly", "rebranded as" patterns
  const aliasPatterns = [
    /\b(?:doing\s+business\s+as|d\/b\/a|aka|also\s+known\s+as|formerly|rebranded\s+as|changed\s+name\s+to)\s+["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})["']?/gi,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\s+(?:inc|llc|ltd|co|corp|corporation|company|group)\b/gi
  ]

  for (const pattern of aliasPatterns) {
    while ((match = pattern.exec(text)) !== null) {
      const alias = match[1] || match[0]
      const lowerAlias = alias.toLowerCase()

      if (seen.has(lowerAlias)) continue
      if (alias.split(/\s+/).length < 2) continue

      seen.add(lowerAlias)

      const excerpt = extractExcerpt(text, match.index, 240)
      const evidence: Evidence = {
        excerpt,
        match: alias,
        source: sourceRef
      }

      candidates.push({
        raw: alias,
        typeHint: 'alias',
        confidence: 0.8,
        evidence: [evidence]
      })
    }
  }

  return candidates
}

/**
 * Extract domain names that are likely brand sites
 */
function extractDomains(text: string, sourceRef: SourceRef): Candidate[] {
  const candidates: Candidate[] = []
  const seen = new Set<string>()

  // Domain pattern
  const domainPattern = /https?:\/\/(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)/g
  let match

  while ((match = domainPattern.exec(text)) !== null) {
    const domain = match[1].toLowerCase()

    // Skip common non-company domains
    if (
      domain.match(/^(reddit|imgur|youtube|twitter|x|facebook|instagram|linkedin|github|stackoverflow|amazon|google|microsoft|apple|netflix|spotify|discord|slack|zoom|dropbox|box|onedrive|drive\.google|docs\.google|mail\.google|accounts\.google)\./i) ||
      domain.includes('redd.it') ||
      domain.split('.').length < 2
    ) {
      continue
    }

    if (seen.has(domain)) continue
    seen.add(domain)

    // Extract company name from domain (second-to-last part)
    const parts = domain.split('.')
    const companyPart = parts[parts.length - 2] || domain

    // Skip if too generic
    if (companyPart.length < 3 || companyPart.match(/^(com|org|net|io|co|us|uk|ca|au)$/i)) {
      continue
    }

    const excerpt = extractExcerpt(text, match.index, 240)
    const evidence: Evidence = {
      excerpt,
      match: domain,
      source: sourceRef
    }

    candidates.push({
      raw: companyPart,
      typeHint: 'domain',
      confidence: 0.7,
      evidence: [evidence]
    })
  }

  return candidates
}

/**
 * Extract excerpt from text around a position
 */
function extractExcerpt(text: string, position: number, maxLength: number): string {
  const start = Math.max(0, position - 60)
  const end = Math.min(text.length, position + maxLength - 60)
  let excerpt = text.substring(start, end)

  if (start > 0) excerpt = '...' + excerpt
  if (end < text.length) excerpt = excerpt + '...'

  return excerpt.trim()
}

/**
 * Parse Reddit thing and extract all text fields
 */
function parseRedditThing(thing: RedditThing): Array<{ text: string; field: SourceRef['field'] }> {
  const fields: Array<{ text: string; field: SourceRef['field'] }> = []

  if (thing.data.title) {
    fields.push({ text: thing.data.title, field: 'title' })
  }

  if (thing.data.selftext) {
    fields.push({ text: thing.data.selftext, field: 'selftext' })
  }

  if (thing.data.body) {
    fields.push({ text: thing.data.body, field: 'body' })
  }

  if (thing.data.url) {
    fields.push({ text: thing.data.url, field: 'url' })
  }

  return fields
}

/**
 * Main extraction function
 */
export function extractCandidates(things: RedditThing[]): Candidate[] {
  const allCandidates: Candidate[] = []
  const candidateMap = new Map<string, Candidate>()

  for (const thing of things) {
    const fields = parseRedditThing(thing)

    if (!thing.data.permalink || !thing.data.created_utc || !thing.data.author || !thing.data.subreddit) {
      continue
    }

    const baseSourceRef: SourceRef = {
      permalink: thing.data.permalink.startsWith('/') ? `https://reddit.com${thing.data.permalink}` : thing.data.permalink,
      createdUtc: thing.data.created_utc,
      author: thing.data.author,
      subreddit: thing.data.subreddit,
      field: 'title' // Will be overridden per field
    }

    for (const { text, field } of fields) {
      const sourceRef: SourceRef = {
        ...baseSourceRef,
        field
      }

      // Extract org name candidates
      const orgCandidates = extractOrgCandidatesFromText(text, sourceRef)
      for (const candidate of orgCandidates) {
        const key = candidate.raw.toLowerCase()
        const existing = candidateMap.get(key)

        if (existing) {
          // Merge evidence
          existing.evidence.push(...candidate.evidence)
          // Update confidence (average)
          existing.confidence = (existing.confidence + candidate.confidence) / 2
        } else {
          candidateMap.set(key, candidate)
        }
      }

      // Extract domain candidates
      const domainCandidates = extractDomains(text, sourceRef)
      for (const candidate of domainCandidates) {
        const key = candidate.raw.toLowerCase()
        const existing = candidateMap.get(key)

        if (existing) {
          existing.evidence.push(...candidate.evidence)
          existing.confidence = (existing.confidence + candidate.confidence) / 2
        } else {
          candidateMap.set(key, candidate)
        }
      }
    }
  }

  // Convert map to array and sort by permalink + index for determinism
  const candidates = Array.from(candidateMap.values())
  candidates.sort((a, b) => {
    const aPermalink = a.evidence[0]?.source.permalink || ''
    const bPermalink = b.evidence[0]?.source.permalink || ''
    if (aPermalink !== bPermalink) {
      return aPermalink.localeCompare(bPermalink)
    }
    return a.raw.localeCompare(b.raw)
  })

  return candidates
}

