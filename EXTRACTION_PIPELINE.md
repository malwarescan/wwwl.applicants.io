# Extraction Pipeline Implementation

## Overview

This document describes the deterministic extraction pipeline that transforms Reddit JSON into publication-ready company entities **without making accusations or applying labels**.

## Problem Statement

The original issue was that company names weren't being "picked up" from Reddit JSON. The real problem was:

1. **Reddit JSON ≠ structured company entities** - Contains free-text, slang, nicknames, misspellings
2. **DevilCorp is a pattern, not a label** - It's a structural model, not a legal classification
3. **Missing extraction layer** - Needed a deterministic ingestion pipeline, not manual name picking

## Solution: 4-Step Extraction Pipeline

### Architecture

```
Reddit JSON
    ↓
STEP 1: Raw Intake (no interpretation)
    ↓
RawCandidate[] - Just extracted strings with metadata
    ↓
STEP 2: Entity Normalization (machine-safe)
    ↓
NormalizedEntity[] - Canonical names, aliases, sources
    ↓
STEP 3: Pattern Scoring (pattern detection)
    ↓
ScoredEntity[] - Risk scores, pattern indicators
    ↓
STEP 4: Publication Gate (threshold filtering)
    ↓
PublicationReadyEntity[] - Approved for publication
```

## Step 1: Raw Intake

**Location**: `server/extraction/step1-raw-intake.ts`

**Purpose**: Extract candidates from Reddit JSON without interpretation.

**What it extracts**:
- Capitalized multi-word phrases (e.g., "Valore Events Inc")
- Company domain URLs
- LinkedIn company links
- Repeated organization-like strings

**Output**: `RawCandidate[]` with:
- `raw_string`: The extracted text
- `source`: Where it came from (reddit, linkedin, etc.)
- `context`: Where in the source (comment, post, url, etc.)
- `confidence`: 0.0-1.0 based on extraction method
- `metadata`: Additional context (subreddit, author, upvotes, etc.)

**Key principle**: No judgment. No labels. Just extraction.

## Step 2: Entity Normalization

**Location**: `server/extraction/step2-entity-normalization.ts`

**Purpose**: Normalize raw candidates to canonical names.

**What it does**:
- Groups similar candidates (e.g., "Valore Events Inc" and "Valore Events")
- Strips common suffixes (Inc, LLC, Marketing, Group, Corp, etc.)
- Selects canonical name (prefers LinkedIn IDs, domains, longer names)
- Collects aliases
- Tracks source types (reddit, linkedin, job_board, etc.)

**Output**: `NormalizedEntity[]` with:
- `canonical_name`: The normalized name
- `aliases`: All variations found
- `sources`: Source types
- `mention_count`: How many times mentioned
- `normalization_confidence`: 0.0-1.0

**Key principle**: Machine-safe normalization. Still no judgment about what the entity is.

## Step 3: Pattern Scoring

**Location**: `server/extraction/step3-pattern-scoring.ts`

**Purpose**: Apply risk scoring dimensions to detect patterns.

**What it scores** (0-100 each):
- `wage_payment`: Commission-only language, payment complaints
- `misrepresentation`: "Not what was advertised" patterns
- `churn_pressure`: High-pressure, burnout patterns
- `recruitment_funnel`: Group interviews, same-day offers
- `legal_threats`: Legal threat mentions
- `identity_obfuscation`: Rebranding indicators, multiple aliases
- `review_pattern_anomaly`: Astroturfing, suspicious clustering

**What it detects**:
- Commission-only language
- Group interview mentions
- Same-day offers
- Rebranding indicators
- Shared addresses
- Network overlap (Smart Circle, Cydcor, Appco, etc.)

**Output**: `ScoredEntity[]` with:
- `pattern_score`: Total score, confidence, subscores
- `pattern_indicators`: Boolean flags for detected patterns
- `evidence_count`: Number of mentions
- `source_type_count`: Number of different source types

**Key principle**: Pattern detection, not accusation. DevilCorp characteristics emerge through scoring, not declaration.

## Step 4: Publication Gate

**Location**: `server/extraction/step4-publication-gate.ts`

**Purpose**: Apply thresholds to determine publication eligibility.

**Thresholds** (configurable):
- `min_mention_count`: Minimum number of mentions (default: 5)
- `min_pattern_score`: Minimum risk score (default: 40)
- `min_source_types`: Minimum source diversity (default: 2)
- `min_confidence`: Minimum confidence (default: 0.5)

**Output**: `PublicationReadyEntity[]` with:
- `publication_status`: 'approved' | 'pending' | 'rejected'
- `rejection_reason`: Why rejected (if applicable)
- `approved_at`: Timestamp when approved

**Key principle**: Only high-confidence, well-sourced entities proceed.

## Usage

### Programmatic

```typescript
import { runExtractionPipeline, defaultConfig } from './server/extraction/pipeline'

const threads: RedditThread[] = [...] // Your Reddit JSON data

const result = await runExtractionPipeline(threads, defaultConfig)

// Access approved entities
for (const entity of result.step4.approved) {
  // Generate company page from entity
  const language = generatePublicationLanguage(entity)
  // ... create markdown file
}
```

### API Endpoint

```bash
POST /api/extraction/process

Body: {
  threads: RedditThread[],
  config?: ExtractionConfig  # Optional, uses default if not provided
}

Response: {
  success: true,
  result: PipelineResult
}
```

## Publication Language

The pipeline generates safe, non-accusatory language:

> "This company has been reported in multiple public sources to share characteristics commonly associated with high-churn, commission-based recruiting organizations."

This phrasing:
- States facts (reported in sources)
- Uses pattern language (characteristics commonly associated)
- Avoids accusations (doesn't say "this IS a DevilCorp")
- Is legally defensible
- Is AI/SEO friendly

## Configuration

Default configuration in `server/extraction/pipeline.ts`:

```typescript
export const defaultConfig: ExtractionConfig = {
  step1: {
    min_confidence: 0.3,
    // ... extraction patterns
  },
  step2: {
    normalization_rules: {
      strip_suffixes: ['Inc', 'LLC', 'Marketing', 'Group', 'Corp', 'Corporation', 'Ltd', 'Limited'],
      min_mention_count: 2
    }
  },
  step3: {
    scoring_weights: {
      wage_payment: 0.20,
      misrepresentation: 0.18,
      churn_pressure: 0.14,
      recruitment_funnel: 0.14,
      legal_threats: 0.10,
      identity_obfuscation: 0.12,
      review_pattern_anomaly: 0.12
    }
  },
  step4: {
    publication_thresholds: {
      min_mention_count: 5,
      min_pattern_score: 40,
      min_source_types: 2,
      min_confidence: 0.5
    }
  }
}
```

## Why This Architecture Works

1. **Deterministic**: Same input → same output
2. **Transparent**: Each step is explicit and auditable
3. **Legally safe**: Pattern-based, not accusatory
4. **AI-friendly**: Explicit uncertainty, transparent methodology
5. **Scalable**: Can process thousands of threads automatically
6. **No inference cost**: Extracts candidates, doesn't guess intent

## Files Created

- `server/extraction/types.ts` - Type definitions
- `server/extraction/step1-raw-intake.ts` - Raw extraction
- `server/extraction/step2-entity-normalization.ts` - Normalization
- `server/extraction/step3-pattern-scoring.ts` - Pattern scoring
- `server/extraction/step4-publication-gate.ts` - Publication gate
- `server/extraction/pipeline.ts` - Orchestrator
- `server/extraction/README.md` - Detailed documentation
- `server/routes/extraction/process.post.ts` - API endpoint

## Next Steps

1. Integrate with Reddit API or JSON import
2. Add OpenCorporates lookup in Step 2
3. Enhance pattern detection in Step 3 with NLP
4. Add company page generation from approved entities
5. Set up scheduled pipeline runs

## Key Insights

- **Reddit JSON is unstructured** - We extract candidates, not entities
- **DevilCorp is a pattern** - We detect patterns, not apply labels
- **Extraction ≠ Interpretation** - We extract, normalize, score, and gate
- **Publication language matters** - Pattern-based descriptions, not accusations

