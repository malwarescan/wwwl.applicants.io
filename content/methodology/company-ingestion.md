---
seo:
  title: Company Ingestion Checklist | Applicants.io Methodology
  description: Guidelines for researchers creating accurate, legally safe, machine-parsable company pages. Evidence collection and risk scoring methodology.
---

# Company Ingestion Checklist

## Goal

Create a company page that is:
- Accurate
- Legally safe
- Machine-parsable
- Easy for AI + Google to extract

## Non-Negotiable Rules

- **Pattern language only.** No accusations phrased as fact.
- **Every key claim must have an Evidence row.**
- **Keep each H2 section under ~120 words, use bullets.**
- **Do not speculate about intent.** Document what is reported/observed.

## Automated Extraction Pipeline

For processing Reddit JSON and other unstructured sources, use the **4-step extraction pipeline**:

1. **Raw Intake**: Extract candidates without interpretation
2. **Entity Normalization**: Normalize to canonical names
3. **Pattern Scoring**: Apply risk scoring dimensions
4. **Publication Gate**: Apply thresholds for publication

See `server/extraction/README.md` for detailed documentation.

**Key principle**: The pipeline extracts candidates and detects patterns, but does not apply labels or make accusations. DevilCorp characteristics emerge through scoring, not declaration.

---

## Inputs to Collect (Minimum Set)

### A) Identity & Entities

- Official name as listed on website or LinkedIn
- Website URL (or "not found")
- Known aliases / DBAs (from job posts, LinkedIn, registries)
- Operating regions (cities/states mentioned in postings)
- Parent / network association hints (Smart Circle, Synaptic, etc.) if publicly referenced

### B) Role & Recruiting Surface

- 3–5 job titles repeatedly used
- Common compensation language (commission-only, "uncapped", "OTE", etc.)
- Interview format signals (group interview, same-day offer, "orientation")
- Training phase signals (unpaid training, "shadowing", "student mentality")

### C) Report Patterns (What people report)

Collect 6–12 evidence items across sources if possible. Prioritize:

- Glassdoor reviews (time-separated)
- Indeed reviews
- Reddit threads (company + city + "legit/scam")
- BBB (if present)
- LinkedIn company page + employee counts / title patterns
- Any public news or court docs (only if solid)

---

## Evidence Row Rules

Each Evidence item must include:

- **Claim**: one sentence, specific, non-interpretive
- **Source**: platform + URL
- **Date captured**: YYYY-MM-DD
- **Excerpt**: short quote or paraphrase (keep short)
- **Credibility score** (0.0–1.0) guideline:
  - **0.9**: court doc, official filing, direct company page
  - **0.7**: review platforms with multiple corroborations
  - **0.5**: single anecdote without corroboration
  - **0.3**: vague forum claims, no detail, no repeats

---

## Risk Subscore Scoring Guidelines (0–100 Each)

### Wage/Payment (W)

- **0–20**: no wage/payment complaints, clear pay structure
- **21–60**: mixed reports, ambiguity, missed commissions alleged
- **61–100**: repeated reports of nonpayment / bait-and-switch pay

### Misrepresentation (M)

- **0–20**: job matches listing language
- **21–60**: repeated "not what was advertised" claims
- **61–100**: consistent pattern of misleading role descriptions

### Churn/Pressure (C)

- **0–20**: normal pressure
- **21–60**: repeated "high pressure, long hours"
- **61–100**: consistent churn, "recruit everyone", burnout patterns

### Recruitment Funnel (R)

- **0–20**: standard interviews
- **21–60**: group interviews, same-day offers, vague roles
- **61–100**: mass interviewing, rapid onboarding, unpaid trial phases

### Legal Threats (L)

- **0–20**: none
- **21–60**: reports of threats without documentation
- **61–100**: documented cease-and-desist patterns or intimidation claims across time

### Identity Obfuscation (O)

- **0–20**: transparent org identity
- **21–60**: frequent DBA usage, unclear parentage
- **61–100**: repeated rebrands, shell-like footprint, inconsistent naming

### Review Pattern Anomaly (A)

- **0–20**: normal distribution
- **21–60**: suspicious clustering, repeated phrasing
- **61–100**: heavy astroturf indicators or sudden rating spikes without explanation

---

## Final Output Requirements

Before publishing, confirm the page includes:

- ✅ Overview (what it is)
- ✅ Risk Summary (score + confidence)
- ✅ Patterns (bulleted)
- ✅ What to do if applying (action steps)
- ✅ Evidence table with at least 6 items
- ✅ FAQ with 3–6 questions tied to candidate intent

---

## Risk Score Calculation

### Weights (sum = 1.00)

- wW = 0.20 (Wage/Payment)
- wM = 0.18 (Misrepresentation)
- wC = 0.14 (Churn/Pressure)
- wR = 0.14 (Recruitment Funnel)
- wL = 0.10 (Legal Threats)
- wO = 0.12 (Identity Obfuscation)
- wA = 0.12 (Review Pattern Anomaly)

### Raw Risk Calculation

```
RiskRaw = (wW*W + wM*M + wC*C + wR*R + wL*L + wO*O + wA*A)
```

### Confidence Calculation

For each evidence item i, define credibility ci in [0,1].
Let N = number of evidence items.

```
Confidence = clamp( (sum(ci)/max(N,1)) * log1p(N)/log(1+10), 0, 1 )
```

**Rules:**
- If N < 3, cap Confidence at 0.45
- If N = 0, RiskFinal must be 0 and page must show "Insufficient evidence"

### Final Risk (Confidence-Adjusted)

```
RiskFinal = round( RiskRaw * (0.60 + 0.40*Confidence) )
```

### Risk Bands

- **0–19**: Low
- **20–39**: Guarded
- **40–59**: Elevated
- **60–79**: High
- **80–100**: Severe

---

## Template Reference

Use `content/companies/_company-template.md` as the base structure.

Ensure all required frontmatter fields are populated:
- title, description, slug
- industry, website, hq, operating_regions
- known_aliases, last_updated
- risk_score (total, confidence, subscores)
- evidence (array with all required fields)
- faqs (array)

---

## Quality Checklist

Before publishing:

- [ ] All evidence items have URLs and dates
- [ ] Credibility scores are justified
- [ ] Subscores align with evidence
- [ ] Risk band language explains the score
- [ ] No speculative language
- [ ] All claims backed by evidence
- [ ] FAQ answers are factual and concise
- [ ] Internal links to related guides/networks

