# Applicants.io Entity Extraction Pipeline

A deterministic, defamation-safe entity extraction and risk scoring pipeline for processing Reddit JSON data.

## Architecture

```
Reddit JSON
    ↓
[1] Extract Candidates (lib/reddit/)
    ↓
[2] Normalize Entities (lib/entities/)
    ↓
[3] Score Patterns (lib/scoring/)
    ↓
[4] Publication Gate (lib/publish/)
    ↓
Published Company Pages
```

## Modules

### 1. Reddit Extraction (`lib/reddit/`)

Extracts candidate organization names from Reddit posts/comments without interpretation.

- `extractCandidates.ts` - Main extraction function
- `types.ts` - Type definitions
- `extractCandidates.test.ts` - Unit tests

**Key Features:**
- Extracts multi-word proper-noun phrases
- Extracts company domains from URLs
- Detects aliases ("formerly known as", "d/b/a")
- Excludes person names without org context
- Deterministic output (sorted by permalink)

### 2. Entity Normalization (`lib/entities/`)

Normalizes raw candidates to canonical entities with high-precision merging.

- `normalizeEntity.ts` - Normalization rules
- `mergeEntities.ts` - Entity merging logic
- `types.ts` - Entity type definitions

**Normalization Steps:**
1. Unicode + whitespace normalization
2. Strip punctuation
3. Standardize connectors
4. Remove corporate suffixes
5. Strip generic tail words (with safety checks)
6. Case normalization
7. Generate slugs

**Merging Rules:**
- Exact canonicalKey match OR
- Jaccard similarity >= 0.9 AND first token matches AND length diff <= 2 tokens
- Excludes merges with location tokens or unique brand tokens

### 3. Pattern Scoring (`lib/scoring/`)

Mathematical risk scoring based on signal patterns.

- `signals.ts` - Signal patterns and weights
- `scoreEntity.ts` - Scoring function
- `types.ts` - Score result types

**Signals:**
- COMMISSION_ONLY_LANGUAGE (weight: 1.1)
- UNPAID_TRAINING_OR_SHADOWING (weight: 1.0)
- GROUP_INTERVIEW (weight: 0.9)
- SAME_DAY_OFFER (weight: 0.8)
- DOOR_TO_DOOR_OR_KIOSK (weight: 0.8)
- REBRAND_DBA (weight: 1.2)
- SEMINAR_CULT_LANGUAGE (weight: 0.7)
- NETWORK_KEYWORDS_OVERLAP (weight: 0.6)

**Scoring Formula:**
```
x_i = log(1 + count(signal_i))
z = b0 + Σ (w_i * x_i)  [b0 = -1.2]
p = 1 / (1 + e^-z)
R0 = 100 * p
R = clamp(0, 100, R0 * consistency_boost)
```

### 4. Publication Gate (`lib/publish/`)

Determines when a company page should be published.

- `shouldPublish.ts` - Gate logic
- `publishState.ts` - State utilities
- `types.ts` - Publish decision types

**Gate Criteria (all must pass):**
- G1: uniqueMentions >= 5
- G2: distinctThreads >= 2 AND distinctAuthors >= 3
- G3: timeSpanDays >= 30 OR distinctSubreddits >= 2
- G4: score >= 55 AND distinctSignals >= 2
- G5: name clarity (tokens >= 2 OR has corporate suffix)

**Publish States:**
- `WATCHLIST` - Not public
- `PUBLIC_LOW` - Score 55-69
- `PUBLIC_MED` - Score 70-84
- `PUBLIC_HIGH` - Score 85+

### 5. Legal Language (`lib/legal/`)

Legally-safe disclaimer text.

- `language.ts` - Disclaimer blocks

## Usage

```typescript
import { runPipeline } from './lib/pipeline'
import type { RedditThing } from './lib/reddit/types'

const redditThings: RedditThing[] = [...] // Your Reddit JSON data

const result = runPipeline(redditThings)

// Access published entities
const published = result.scored.filter(s => s.publishDecision.publish)

for (const item of published) {
  console.log(`Entity: ${item.entity.canonicalName}`)
  console.log(`Score: ${item.score.score}`)
  console.log(`State: ${item.publishDecision.state}`)
}
```

## Legal Safety

All output text uses pattern-based language:
- "This page summarizes publicly available reports..."
- "Our risk score reflects the presence and repetition of specific patterns..."
- "A higher score means more independent reports describe similar patterns..."

No accusations. No labels. Only pattern aggregation.

## Testing

Run tests with your test runner:

```bash
# Example with vitest
npm test lib/reddit/extractCandidates.test.ts
```

## Determinism

All functions are deterministic:
- Same input → same output
- Sorted outputs for consistency
- No random or time-based behavior
- Reproducible results

## Precision > Recall

The pipeline prioritizes precision:
- High-precision merging (won't merge unrelated entities)
- Conservative extraction (excludes person names, common false positives)
- Strict publication gates (requires multiple sources, time spread)
- Pattern-based scoring (not vibes-based)

