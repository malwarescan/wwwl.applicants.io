# Extraction Pipeline Architecture

## Overview

The extraction pipeline is a 4-step deterministic process that transforms raw Reddit JSON into publication-ready company entities **without making accusations or applying labels**.

## Core Principles

1. **No implicit interpretation** - We extract candidates, not accusations
2. **Pattern detection, not labeling** - DevilCorp is a pattern, not a legal classification
3. **Deterministic processing** - Same input always produces same output
4. **Transparent methodology** - Each step is explicit and auditable
5. **Legally safe language** - Publication uses pattern-based descriptions, not accusations

## Pipeline Flow

```
Reddit JSON
    ↓
STEP 1: Raw Intake
    ↓
RawCandidate[] (no interpretation)
    ↓
STEP 2: Entity Normalization
    ↓
NormalizedEntity[] (machine-safe normalization)
    ↓
STEP 3: Pattern Scoring
    ↓
ScoredEntity[] (risk scores, pattern indicators)
    ↓
STEP 4: Publication Gate
    ↓
PublicationReadyEntity[] (threshold-filtered)
```

## Step 1: Raw Intake

**Purpose**: Extract candidates from Reddit JSON without interpretation.

**What it does**:
- Extracts capitalized multi-word phrases
- Extracts company domain URLs
- Extracts LinkedIn company links
- Assigns confidence scores based on extraction method

**Output**: `RawCandidate[]`

**Key characteristics**:
- No judgment about what the candidate represents
- No labels applied
- Just extracted strings with metadata

## Step 2: Entity Normalization

**Purpose**: Normalize raw candidates to canonical names.

**What it does**:
- Groups similar candidates (e.g., "Valore Events Inc" and "Valore Events")
- Strips common suffixes (Inc, LLC, Marketing, Group)
- Selects canonical name (prefers LinkedIn IDs, domains, longer names)
- Collects aliases
- Tracks source types

**Output**: `NormalizedEntity[]`

**Key characteristics**:
- Machine-safe normalization
- Still no judgment about what the entity is
- Just name normalization and grouping

## Step 3: Pattern Scoring

**Purpose**: Apply risk scoring dimensions to detect patterns.

**What it does**:
- Scores 7 risk dimensions (wage/payment, misrepresentation, churn/pressure, etc.)
- Detects pattern indicators (commission-only language, group interviews, etc.)
- Calculates total risk score and confidence
- Identifies network overlaps (Smart Circle, Cydcor, etc.)

**Output**: `ScoredEntity[]`

**Key characteristics**:
- Pattern detection, not accusation
- Scores indicate risk levels, not labels
- DevilCorp characteristics emerge through scoring, not declaration

## Step 4: Publication Gate

**Purpose**: Apply thresholds to determine publication eligibility.

**What it does**:
- Checks mention count threshold
- Checks pattern score threshold
- Checks source type diversity threshold
- Checks confidence threshold
- Only entities passing all gates are approved

**Output**: `PublicationReadyEntity[]`

**Key characteristics**:
- Threshold-based filtering
- Explicit rejection reasons
- Only high-confidence, well-sourced entities proceed

## Usage

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

## Configuration

Modify `defaultConfig` in `pipeline.ts` to adjust:
- Minimum confidence thresholds
- Normalization rules
- Scoring weights
- Publication thresholds

## Publication Language

The pipeline generates safe, non-accusatory language:

> "This company has been reported in multiple public sources to share characteristics commonly associated with high-churn, commission-based recruiting organizations."

This phrasing:
- States facts (reported in sources)
- Uses pattern language (characteristics commonly associated)
- Avoids accusations (doesn't say "this IS a DevilCorp")
- Is legally defensible
- Is AI/SEO friendly

## Why This Architecture Works

1. **Deterministic**: Same input → same output
2. **Transparent**: Each step is explicit and auditable
3. **Legally safe**: Pattern-based, not accusatory
4. **AI-friendly**: Explicit uncertainty, transparent methodology
5. **Scalable**: Can process thousands of threads automatically

## Next Steps

1. Integrate with Reddit API or JSON import
2. Add OpenCorporates lookup in Step 2
3. Enhance pattern detection in Step 3 with NLP
4. Add company page generation from approved entities
5. Set up scheduled pipeline runs

