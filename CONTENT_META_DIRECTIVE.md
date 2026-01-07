# Applicants.io Content Meta Directive

**Content Placement, Chunking, and Retrieval Optimization**

## 0. Prime Directive (Non-Negotiable)

Applicants.io content exists to be:
- **Machine-parsable first**
- **Human-readable second**
- **Inference-cheap**
- **Legally safe**
- **SEO / GEO / AEO dominant**

All content must:
- Live in `content/`
- Map 1:1 to routes
- Be independently retrievable
- Avoid narrative dependency between sections

---

## 1. Content Collections → Purpose Mapping

### `/content/companies/`

**Primary money pages. Highest authority.**

Used for:
- "Is X legit?"
- AI citations
- Employer risk lookups

Each company gets **one canonical page only**.

**Structure:**
```
content/companies/company-slug.md
```

**Required sections (fixed order, fixed headings):**

```markdown
# Company Name

## Overview
## Risk Summary
## Compensation Structure
## Hiring & Interview Patterns
## Reported Experiences (Aggregated)
## Network Associations
## Risk Score Explanation
## FAQ
```

**Why:**
- Each `##` becomes a retrieval node
- LLMs can quote individual sections without context bleed
- Google AI Overviews favors explicit sectioning

**Template:** See `content/companies/_template.md`

---

### `/content/methodology/`

**Trust anchor. Explains how scoring works.**

Used for:
- "How does Applicants.io score companies?"
- Defensibility
- E-E-A-T reinforcement

**Structure:**
```
content/methodology/
  ├── overview.md
  ├── risk-scoring.md
  ├── data-sources.md
  └── limitations.md
```

**Rules:**
- No narrative storytelling
- Deterministic language only
- Bullet-first explanations

---

### `/content/guides/`

**Candidate education. Mid-funnel.**

Used for:
- "What is commission-only work?"
- "What is DevilCorp?"
- "What does unpaid training mean?"

Each guide answers **one question only**.

**Structure:**
```
content/guides/commission-only-jobs.md
content/guides/unpaid-training.md
```

**Guides must:**
- Open with a definition
- Follow with mechanics
- End with warning signs

---

### `/content/networks/`

**High-risk, high-authority content.**

Used for:
- Smart Circle
- Synaptic
- Known recruiting trees

**Structure:**
```
content/networks/network-name.md
```

**Rules:**
- Describe mechanics, not accusations
- Focus on patterns, not claims
- Heavy internal linking to companies

---

## 2. Page Structure Rules (Lowest Inference Cost)

Every markdown file must follow:
- **One `#` only** (H1)
- **No skipped heading levels**
- **No prose-only sections longer than ~120 words**
- **Lists > paragraphs** whenever possible

**Bad:**
```
Long narrative paragraphs with implied connections between ideas that require the reader to infer relationships and draw conclusions from context.
```

**Good:**
```
## Section Name

- Explicit point one
- Explicit point two
- Explicit point three

[Brief explanation if needed - max 120 words]
```

---

## 3. Navigation Is NOT Cosmetic

Navigation mirrors search intent, not site aesthetics.

**Rule:** If it's a top nav item, it must map to a high-volume query class.

**Allowed top-level navs:**
- Companies
- How We Score (methodology)
- Guides
- Networks
- About

**Never:**
- "Careers"
- "Apply"
- "Partners"

---

## 4. Route Mapping Logic

Routes are auto-generated and must stay predictable.

**Examples:**
- `/companies/valore-events` → `content/companies/valore-events.md`
- `/networks/smart-circle` → `content/networks/smart-circle.md`
- `/guides/commission-only-jobs` → `content/guides/commission-only-jobs.md`
- `/methodology/risk-scoring` → `content/methodology/risk-scoring.md`

**Rules:**
- No query params
- No dynamic slugs outside companies
- File name = URL slug

---

## 5. SEO / GEO / AEO Enforcement

Every content file must support:

### SEO
- Exact-match H1
- Self-canonical URL
- Internal links upward and downward

### GEO
- Location references only when structurally relevant
- No city stuffing
- Geography belongs in company context, not global prose

### AEO
- Explicit definitions
- Clear enumerations
- FAQ sections where ambiguity exists

**Frontmatter Example:**
```yaml
---
seo:
  title: Company Name - Risk Assessment | Applicants.io
  description: Comprehensive risk assessment and company analysis for [Company Name]. Review compensation structure, hiring patterns, and reported experiences.
---
```

---

## 6. Content Chunking Rules (Critical)

Each section must be answerable in isolation.

**Ask before writing:**
> "If an AI pulled only this section, would it still make sense?"

If not, rewrite.

**This is how you win AI Overviews.**

---

## 7. Where NOT to Put Content

**Never place:**
- Investigative summaries in components
- Core text in Vue files
- Definitions in footers
- Risk explanations in FAQs only

**All meaning lives in `content/`.**

Components only render.

---

## 8. Final Enforcement Statement

Applicants.io is a **knowledge system, not a blog**.

Every file:
- Is a data node
- Is a retrieval target
- Is legally constrained
- Is inference-minimized

**If content cannot be cleanly placed under:**
- `companies/`
- `guides/`
- `methodology/`
- `networks/`

**It does not belong on the site.**

---

## Quick Reference

### File Naming
- Use kebab-case: `company-name.md`
- No spaces, no underscores (except templates)
- One file per entity

### Heading Structure
```
# One H1 only (page title)

## Section 1 (required sections vary by type)
## Section 2
## Section 3

### Subsection (if needed)
```

### Content Length
- H1: Company/Guide/Network name
- H2 sections: Max 120 words of prose
- Prefer lists over paragraphs
- FAQ answers: Max 50 words

### Internal Linking
- Link to related companies: `[Company Name](/companies/company-slug)`
- Link to guides: `[Guide Name](/guides/guide-slug)`
- Link to networks: `[Network Name](/networks/network-slug)`
- Link to methodology: `[Methodology Topic](/methodology/topic-slug)`

---

## Content Type Checklists

### Company Page Checklist
- [ ] H1 is exact company name
- [ ] All 8 required sections present
- [ ] Sections in fixed order
- [ ] Risk score included
- [ ] FAQ section with 3+ questions
- [ ] SEO frontmatter complete
- [ ] No prose > 120 words
- [ ] Internal links to related companies/networks

### Guide Checklist
- [ ] Answers one question only
- [ ] Opens with definition
- [ ] Explains mechanics
- [ ] Lists warning signs
- [ ] SEO frontmatter complete
- [ ] No prose > 120 words
- [ ] Internal links to related companies/guides

### Network Page Checklist
- [ ] Describes mechanics, not accusations
- [ ] Focuses on patterns
- [ ] Lists associated companies
- [ ] Explains organizational structure
- [ ] SEO frontmatter complete
- [ ] Heavy internal linking
- [ ] No prose > 120 words

### Methodology Page Checklist
- [ ] Deterministic language only
- [ ] Bullet-first explanations
- [ ] No narrative storytelling
- [ ] Clear, factual statements
- [ ] SEO frontmatter complete
- [ ] Supports E-E-A-T

---

## Legal Safety Guidelines

- Use factual statements only
- Focus on patterns, not individual claims
- Avoid accusatory language
- Cite public sources when possible
- Use "reported" or "alleged" for unverified claims
- Focus on structural indicators, not personal attacks

---

## AI Retrieval Optimization

- Each H2 section = independent retrieval node
- Sections must be self-contained
- Use explicit headings, not implied relationships
- Lists are more parseable than paragraphs
- Definitions should be explicit, not inferred
- FAQ sections help with ambiguous queries

---

**Last Updated:** [Current Date]
**Version:** 1.0

