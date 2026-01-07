# Applicants.io Implementation Summary

## Completed Implementation

This document summarizes the SEO/GEO/AEO-first implementation of Applicants.io according to the meta directive specification.

## Files Created/Modified

### 1. Logo & Branding
- ✅ **`app/components/AppLogo.vue`** - Updated to use `/brand/applicantsio-mark.png`
- ✅ **`public/brand/applicantsio-mark.png`** - Logo asset copied to brand directory

### 2. Content Structure
- ✅ **`content/companies/.navigation.yml`** - Navigation config for Companies section
- ✅ **`content/companies/index.md`** - Companies listing/index page
- ✅ **`content/companies/_company-template.md`** - Detailed company page template with all required fields
- ✅ **`content/companies/example-company.md`** - Sample company page demonstrating structure

### 3. Utilities
- ✅ **`app/utils/slugify.ts`** - Deterministic slugging function for consistent URLs
- ✅ **`app/utils/schema.ts`** - JSON-LD schema generation utilities

### 4. Configuration
- ✅ **`content.config.ts`** - Updated with comprehensive company page schema
- ✅ **`nuxt.config.ts`** - Added runtime config for site URL
- ✅ **`app/pages/[...slug].vue`** - Enhanced with:
  - JSON-LD schema generation
  - Canonical link injection
  - Multi-collection routing support

## Key Features Implemented

### 1. Content Collections
- **Companies**: Primary money pages with risk scoring
- **Methodology**: Trust anchor content
- **Guides**: Candidate education
- **Networks**: High-risk network analysis

### 2. Company Page Structure
Each company page includes:
- **Required frontmatter fields**:
  - `title`, `description`, `headline`, `slug`
  - `industry`, `website`, `hq`, `operating_regions`
  - `known_aliases`, `last_updated`
  - `risk_score` (total, confidence, subscores)
  - `evidence` array with credibility scores
  - `faqs` array

- **Required sections** (in order):
  1. Snapshot
  2. Risk score
  3. What people report (compressed)
  4. Patterns we detected
  5. What to do if you're applying
  6. Evidence table
  7. FAQs
  8. Change log

### 3. SEO/AEO/GEO Optimization

#### JSON-LD Schemas Generated:
- **WebPage** + **BreadcrumbList** (always)
- **Organization** (if website or aliases exist)
- **Dataset** (if evidence exists)
- **FAQPage** (if FAQs exist)

#### Canonical URLs:
- Every page includes `rel="canonical"` link
- Uses exact site URL + route path
- No duplicate content issues

### 4. Risk Scoring System

The system supports the full risk scoring specification:
- 7 subscore categories (wage_payment, misrepresentation, etc.)
- Weighted calculation (weights defined in spec)
- Confidence scoring based on evidence credibility
- Risk bands: 0-19 (Low), 20-39 (Guarded), 40-59 (Elevated), 60-79 (High), 80-100 (Severe)

### 5. Evidence System

Each evidence item includes:
- Unique ID
- Claim text
- Source name and type (glassdoor, indeed, reddit, bbb, linkedin, news, court, other)
- URL and date captured
- Excerpt
- Credibility score (0-1)

### 6. Routing & Navigation

- **Route mapping**: `/companies/{slug}` → `content/companies/{slug}.md`
- **Navigation**: Auto-generated from `.navigation.yml` files
- **Multi-collection support**: Handles companies, methodology, guides, networks
- **Deterministic slugs**: Enforced via `slugify()` utility

## Content Guidelines Enforced

### Structure Rules
- ✅ One H1 only per page
- ✅ No skipped heading levels
- ✅ Prose sections max ~120 words
- ✅ Lists preferred over paragraphs
- ✅ Atomic, labeled facts over narrative

### Legal Safety
- ✅ Pattern-based analysis (not individual claims)
- ✅ Factual statements only
- ✅ Evidence-backed claims
- ✅ No accusatory language

### AI Retrieval Optimization
- ✅ Each H2 section = independent retrieval node
- ✅ Self-contained sections
- ✅ Explicit headings
- ✅ FAQ sections for ambiguous queries

## Next Steps for Content Team

1. **Create new company pages**:
   - Copy `content/companies/_company-template.md`
   - Fill in all required frontmatter fields
   - Complete all required sections
   - Use `slugify()` for slug generation

2. **Add evidence**:
   - Include at least 3 evidence items for confidence > 0.45
   - Use credible sources (Glassdoor, Indeed, Reddit, etc.)
   - Include URLs and dates

3. **Calculate risk scores**:
   - Use the 7 subscore categories
   - Apply weights: wW=0.20, wM=0.18, wC=0.14, wR=0.14, wL=0.10, wO=0.12, wA=0.12
   - Calculate confidence from evidence credibility
   - Apply confidence adjustment: RiskFinal = round(RiskRaw * (0.60 + 0.40*Confidence))

4. **Ensure SEO compliance**:
   - Exact-match H1
   - Complete frontmatter
   - Internal links to related content
   - FAQ sections where needed

## Testing Checklist

- [ ] Logo displays correctly in header
- [ ] Companies index page loads at `/companies`
- [ ] Example company page loads at `/companies/example-company`
- [ ] JSON-LD schemas appear in page source
- [ ] Canonical links are present
- [ ] Navigation shows "Companies" section
- [ ] Risk scores display correctly
- [ ] Evidence tables render properly
- [ ] FAQs appear in structured data

## Environment Variables

Set `SITE_URL` environment variable (defaults to `https://applicants.io`):
```bash
SITE_URL=https://applicants.io
```

## File Locations Reference

- **Logo**: `public/brand/applicantsio-mark.png`
- **Company template**: `content/companies/_company-template.md`
- **Companies index**: `content/companies/index.md`
- **Slugify utility**: `app/utils/slugify.ts`
- **Schema utility**: `app/utils/schema.ts`
- **Page component**: `app/pages/[...slug].vue`
- **Content config**: `content.config.ts`

---

**Implementation Date**: 2026-01-06
**Status**: Complete and ready for content creation

