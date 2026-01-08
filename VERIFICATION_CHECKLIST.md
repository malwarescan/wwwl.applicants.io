# Verification Checklist - Applicants.io Implementation

## ✅ 1. Route + Content Integrity

### Routes to Test (Server-Side Rendering)
Test each route to confirm it resolves server-side (no client-only fallbacks):

- [ ] `/companies` - Should load companies index page
- [ ] `/companies/example-company` - Should load example company page
- [ ] `/guides/commission-only-jobs` - Should load guide page
- [ ] `/methodology/risk-scoring` - Should load methodology page
- [ ] `/networks/smart-circle` - Should load network page

### Testing Method
1. Run `npm run dev` or `pnpm dev`
2. Visit each URL directly
3. View page source (not inspect element)
4. Confirm content is present in HTML source
5. Check for any client-side hydration warnings

### Expected Behavior
- All routes should return 200 status
- Content should be visible in page source
- No "loading..." states or client-side fallbacks
- Fast initial page load

---

## ✅ 2. JSON-LD Validation (Critical)

### For Company Pages (e.g., `/companies/example-company`)

#### Step 1: View Page Source
1. Navigate to a company page
2. Right-click → "View Page Source" (not Inspect)
3. Search for `application/ld+json`
4. Confirm JSON-LD blocks exist in HTML

#### Step 2: Validate Schema
Test in these validators:

**Google Rich Results Test:**
- URL: https://search.google.com/test/rich-results
- Enter company page URL
- Should show: WebPage, BreadcrumbList, Dataset, FAQPage

**Schema.org Validator:**
- URL: https://validator.schema.org/
- Paste page URL or HTML
- Should validate all schemas without errors

#### Expected Schemas (for company pages with full data):
- ✅ **WebPage** (always present)
- ✅ **BreadcrumbList** (always present)
- ✅ **Dataset** (if evidence exists)
- ✅ **FAQPage** (if FAQs exist)
- ✅ **Organization** (if website or aliases exist)

#### Required Fields Check
- WebPage: name, description, url, isPartOf
- BreadcrumbList: itemListElement with 3 items
- Dataset: name, description, url, dateModified, variableMeasured
- FAQPage: mainEntity array with Question/Answer pairs
- Organization: name, url (if available)

---

## ✅ 3. Canonical Discipline

### Check Every Page Type

#### Homepage (`/`)
- [ ] `<link rel="canonical" href="https://applicants.io/">`
- [ ] No trailing slash issues
- [ ] Exact match to route

#### Company Pages (`/companies/example-company`)
- [ ] `<link rel="canonical" href="https://applicants.io/companies/example-company">`
- [ ] No trailing slash
- [ ] No query parameters
- [ ] Exact match to route

#### Guide Pages (`/guides/commission-only-jobs`)
- [ ] Canonical link present
- [ ] Correct URL format
- [ ] No trailing slash

#### Methodology Pages (`/methodology/risk-scoring`)
- [ ] Canonical link present
- [ ] Correct URL format

#### Network Pages (`/networks/smart-circle`)
- [ ] Canonical link present
- [ ] Correct URL format

### Testing Method
1. View page source
2. Search for `rel="canonical"`
3. Verify URL matches route exactly
4. Check for trailing slashes (should be none except root)
5. Confirm no query parameters

### Common Issues to Avoid
- ❌ Trailing slash mismatch (`/companies/` vs `/companies`)
- ❌ Query parameters (`?utm_source=...`)
- ❌ HTTP vs HTTPS mismatch
- ❌ www vs non-www mismatch

---

## ✅ 4. Navigation = Intent Mapping

### Sidebar Order Verification

The navigation should appear in this order (reflecting search demand):

1. **Companies** (highest intent)
2. **How We Score** (methodology)
3. **Guides** (education)
4. **Networks** (specialized)

### Testing Method
1. Navigate to any content page
2. Check left sidebar navigation
3. Verify section order matches above
4. Confirm section titles are correct

### Navigation Files Location
- `content/companies/.navigation.yml` → "Companies"
- `content/methodology/.navigation.yml` → "How We Score"
- `content/guides/.navigation.yml` → "Guides"
- `content/networks/.navigation.yml` → "Networks"

---

## ✅ 5. Risk Band Language

### Company Pages Should Include

After the risk score, add one short line explaining the risk level:

**Examples:**
- "Low risk based on available evidence"
- "Guarded risk with some patterns of concern"
- "Elevated risk due to repeated reports of [specific issue]"
- "High risk with consistent multi-city patterns"
- "Severe risk with widespread evidence across multiple sources"

### Check Example Company
- [ ] `/companies/example-company` includes risk band explanation
- [ ] Language is concise and factual
- [ ] Explains why the score is at that level

---

## ✅ 6. Companies Index Signal

### `/companies/index.md` Should Include

- [ ] Short paragraph explaining what the list represents
- [ ] Visible risk bands with descriptions
- [ ] Clear table/list of companies
- [ ] Link to methodology

### Current Status
✅ Already includes:
- Explanation paragraph
- Risk band descriptions
- Company table
- Methodology link

---

## ✅ 7. Content Structure Verification

### Company Page Required Sections
Verify example company has all required sections in order:

1. [ ] Snapshot
2. [ ] Risk score (with band explanation)
3. [ ] What people report (compressed)
4. [ ] Patterns we detected
5. [ ] What to do if you're applying
6. [ ] Evidence table
7. [ ] FAQs
8. [ ] Change log

### Frontmatter Required Fields
- [ ] title
- [ ] description
- [ ] slug
- [ ] risk_score (total, confidence, subscores)
- [ ] evidence (array)
- [ ] faqs (array)

---

## ✅ 8. Server-Side Rendering Verification

### Critical: JSON-LD Must Be Server-Rendered

**Test:**
1. Disable JavaScript in browser
2. Load company page
3. View page source
4. JSON-LD should still be present

**Current Implementation:**
- JSON-LD is generated in `app/pages/[...slug].vue`
- Uses `useHead()` with `script` array
- Should be server-rendered by Nuxt

**If JSON-LD is missing:**
- Check that `headScripts` computed is properly reactive
- Verify `useHead()` is called at top level (not in conditional)
- Ensure schemas are generated before page render

---

## ✅ 9. URL Structure Verification

### Slug Format
- [ ] All slugs use kebab-case
- [ ] No spaces or special characters
- [ ] Consistent format across all pages
- [ ] Matches file names (except index.md)

### Route Mapping
- [ ] `/companies/{slug}` → `content/companies/{slug}.md`
- [ ] `/guides/{slug}` → `content/guides/{slug}.md`
- [ ] `/methodology/{slug}` → `content/methodology/{slug}.md`
- [ ] `/networks/{slug}` → `content/networks/{slug}.md`

---

## ✅ 10. Performance Checks

### Initial Load
- [ ] Page loads quickly (< 2s)
- [ ] No layout shift
- [ ] Content visible immediately
- [ ] No loading spinners

### SEO Signals
- [ ] Fast Time to First Byte (TTFB)
- [ ] Server-rendered HTML
- [ ] No client-side only content
- [ ] Proper meta tags

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Test routes (in browser or curl)
curl http://localhost:3000/companies
curl http://localhost:3000/companies/example-company
curl http://localhost:3000/guides/commission-only-jobs
curl http://localhost:3000/methodology/risk-scoring
curl http://localhost:3000/networks/smart-circle

# Check for JSON-LD in source
curl http://localhost:3000/companies/example-company | grep "application/ld+json"

# Check for canonical links
curl http://localhost:3000/companies/example-company | grep "canonical"
```

---

## Issues Found & Fixed

### Fixed Issues
- ✅ Added canonical link to homepage
- ✅ Fixed canonical URL trailing slash handling
- ✅ Added risk band language to example company
- ✅ Improved companies index page with better signal
- ✅ Verified navigation order matches intent

### Potential Issues to Watch
- ⚠️ JSON-LD script injection - verify server-side rendering
- ⚠️ Route resolution for index pages - test `/companies` route
- ⚠️ Collection query performance - monitor with many pages

---

## Next Steps After Verification

1. **Create 5-10 Real Company Pages**
   - Known DevilCorp entities
   - High Reddit complaint volume
   - Rebranded DBAs

2. **Add More Explainer Guides**
   - "What is commission-only recruiting?"
   - "What is unpaid training?"
   - "Why companies rebrand frequently"

3. **Link Strategy**
   - Link from company pages → guides
   - Link from guides → related companies
   - Create semantic loops

4. **Delay These Features**
   - User accounts
   - Comments
   - Submission forms
   - Voting
   - Opinions

---

**Last Verified**: [Date]
**Status**: Ready for content expansion




