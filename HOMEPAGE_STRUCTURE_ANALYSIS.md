# Homepage Structure & Sectioning Analysis

## Overview

The homepage (`content/index.md`) uses Nuxt UI's prose components to create a structured, visually appealing landing page. The page follows a clear information hierarchy with distinct sections.

---

## Page Architecture

### File Structure
- **Content File**: `content/index.md` (from `landing` collection)
- **Page Component**: `app/pages/index.vue` (renders content with `ContentRenderer`, `prose: false`)
- **Layout**: Default layout (no specific layout wrapper)
- **Global Wrapper**: `app/app.vue` provides `AppHeader`, `UMain`, `AppFooter`

---

## Section Breakdown

### 1. Hero Section
**Component**: `::u-page-hero`
**Lines**: 7-39
**Purpose**: Primary value proposition and call-to-action

**Structure**:
```mdc
::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
  orientation: horizontal
  #top: hero-background (animated background component)
  #title: "Evaluate Job Offers [Before You Accept Them]{.text-primary}."
  #description: Value proposition text
  #links: Two CTA buttons
    - Primary: "Search Companies" → /companies
    - Secondary: "How We Score" → /methodology/overview
::
```

**Visual Elements**:
- Dark gradient background (`neutral-900` to `neutral-950`)
- Horizontal layout (content side-by-side)
- Animated hero background component
- Primary text highlight on "Before You Accept Them"
- Two prominent CTA buttons (primary + outline variant)

**Content Strategy**:
- Immediate value proposition
- Clear action items
- Visual hierarchy with gradient background

---

### 2. How It Works Section
**Component**: `::u-page-section`
**Lines**: 41-106
**Purpose**: Explain the 5-step process

**Structure**:
```mdc
::u-page-section{class="dark:bg-neutral-950"}
  #title: "How It Works"
  #description: "Our process follows five steps:"
  ::steps (5-step process visualization)
    :::step (Collection)
    :::step (Normalization)
    :::step (Pattern Detection)
    :::step (Risk Scoring)
    :::step (Publication)
  ::
  Closing paragraph text
::
```

**Visual Elements**:
- Dark background (`neutral-950`)
- Step-by-step visual flow with icons
- Each step has: icon, title, description

**Content Strategy**:
- Process transparency
- Visual flow (left-to-right progression)
- Builds trust through transparency

**Steps**:
1. **Collection** (database icon) - Data gathering
2. **Normalization** (file-check icon) - Entity standardization
3. **Pattern Detection** (search icon) - Pattern identification
4. **Risk Scoring** (bar-chart icon) - Scoring algorithm
5. **Publication** (file-text icon) - Content publishing

---

### 3. The Tools Section
**Component**: `::u-page-section` with `#features`
**Lines**: 108-178
**Purpose**: Showcase platform features/capabilities

**Structure**:
```mdc
::u-page-section{class="dark:bg-neutral-950"}
  #title: "The Tools"
  #features (6 feature cards in grid)
    :::u-page-feature (Company Intelligence Pages)
    :::u-page-feature (Risk Scoring System)
    :::u-page-feature (Network Pattern Analysis)
    :::u-page-feature (Candidate Guides)
    :::u-page-feature (Transparent Methodology)
    :::u-page-feature (Fast Search)
  ::
::
```

**Visual Elements**:
- Dark background (`neutral-950`)
- Grid layout (responsive, likely 3 columns on desktop)
- Each feature has: icon, title, description

**Content Strategy**:
- Feature showcase
- Grid layout for scannability
- Icons for visual recognition

**Features** (6 total):
1. **Company Intelligence Pages** (building icon)
2. **Risk Scoring System** (bar-chart icon)
3. **Network Pattern Analysis** (network icon)
4. **Candidate Guides** (book icon)
5. **Transparent Methodology** (shield-check icon)
6. **Fast Search** (search icon)

---

### 4. Who This Is For Section
**Component**: `::u-page-section` with `::card-group`
**Lines**: 180-223
**Purpose**: Define target audience

**Structure**:
```mdc
::u-page-section{class="dark:bg-neutral-950"}
  #title: "Who This Is For"
  #description: "Applicants.io is designed for:"
  ::card-group (3 cards)
    :::card (Job Seekers)
    :::card (Researchers)
    :::card (Decision Makers)
  ::
  Disclaimer text
::
```

**Visual Elements**:
- Dark background (`neutral-950`)
- Card-based layout (3 cards)
- Each card has: icon, title, description

**Content Strategy**:
- Audience definition
- Clear use cases
- Legal disclaimer included

**Audience Segments**:
1. **Job Seekers** (briefcase icon) - Evaluating offers
2. **Researchers** (search icon) - Researching companies
3. **Decision Makers** (shield-alert icon) - Legitimacy checks

**Disclaimer**: "Applicants.io does not host job listings and does not facilitate applications."

---

### 5. Important Clarification Section
**Component**: `::u-page-section`
**Lines**: 225-233
**Purpose**: Legal disclaimer and accuracy statement

**Structure**:
```mdc
::u-page-section{class="dark:bg-neutral-950"}
  #title: "Important Clarification"
  #description: Legal disclaimer text
::
```

**Visual Elements**:
- Dark background (`neutral-950`)
- Simple text block
- No interactive elements

**Content Strategy**:
- Legal protection
- Transparency about data sources
- Contact mechanism for corrections

**Key Points**:
- No claims of unlawful conduct
- Data from public sources
- Pattern aggregation only
- Review process for inaccuracies

---

### 6. Call-to-Action Section
**Component**: `::u-page-section` with `::u-page-c-t-a`
**Lines**: 235-253
**Purpose**: Final conversion prompt

**Structure**:
```mdc
::u-page-section{class="dark:bg-gradient-to-b from-neutral-950 to-neutral-900"}
  :::u-page-c-t-a
    title: "Ready to research a company?"
    description: Value proposition text
    links: [2 buttons]
      - Primary: "Search Companies" → /companies
      - Secondary: "Learn How We Score" → /methodology/overview
    :stars-bg (animated background)
  :::
::
```

**Visual Elements**:
- Gradient background (`neutral-950` to `neutral-900`)
- Animated stars background component
- Two CTA buttons
- Centered layout

**Content Strategy**:
- Final conversion opportunity
- Multiple action paths
- Visual interest with animated background

---

## Visual Hierarchy

### Background Colors (Dark Mode)
1. **Hero**: `neutral-900` → `neutral-950` (gradient)
2. **Sections 2-5**: `neutral-950` (solid)
3. **CTA**: `neutral-950` → `neutral-900` (gradient)

### Typography Hierarchy
- **Hero Title**: Largest, with primary color highlight
- **Section Titles**: Large, bold
- **Descriptions**: Medium, regular weight
- **Feature/Card Titles**: Medium, bold
- **Feature/Card Descriptions**: Small, regular weight

### Component Hierarchy
1. **Hero** (largest, most prominent)
2. **Sections** (equal visual weight)
3. **CTA** (final conversion point)

---

## Content Flow

```
Hero (Value Prop + CTAs)
    ↓
How It Works (Process Transparency)
    ↓
The Tools (Feature Showcase)
    ↓
Who This Is For (Audience Definition)
    ↓
Important Clarification (Legal/Trust)
    ↓
CTA (Final Conversion)
```

**Flow Logic**:
1. **Hook** (Hero) - Immediate value
2. **Explain** (How It Works) - Build trust
3. **Showcase** (Tools) - Demonstrate value
4. **Target** (Audience) - Define users
5. **Protect** (Clarification) - Legal safety
6. **Convert** (CTA) - Final action

---

## Component Usage Summary

| Component | Usage Count | Purpose |
|-----------|-------------|---------|
| `u-page-hero` | 1 | Hero section with CTAs |
| `u-page-section` | 5 | Content sections |
| `steps` | 1 | Process visualization |
| `u-page-feature` | 6 | Feature cards |
| `card-group` + `card` | 3 | Audience cards |
| `u-page-c-t-a` | 1 | Final CTA section |
| `u-button` | 4 | Action buttons |
| `hero-background` | 1 | Animated hero background |
| `stars-bg` | 1 | Animated CTA background |

---

## Design Patterns

### 1. **Consistent Sectioning**
- All content sections use `u-page-section`
- Consistent dark backgrounds
- Clear title/description pattern

### 2. **Visual Interest**
- Gradients on hero and CTA
- Animated backgrounds (hero, stars)
- Icon usage throughout

### 3. **Content Types**
- **Process**: Steps component
- **Features**: Feature grid
- **Audience**: Card group
- **Legal**: Simple text block
- **Conversion**: CTA component

### 4. **Responsive Design**
- Grid layouts adapt to screen size
- Horizontal hero on desktop, vertical on mobile
- Card groups wrap responsively

---

## Recommendations for Analysis

### Strengths
✅ Clear information hierarchy
✅ Multiple conversion points
✅ Visual interest with animations
✅ Legal protection included
✅ Process transparency builds trust

### Potential Improvements
- Consider adding social proof (testimonials, usage stats)
- Add trust signals (security badges, data sources)
- Consider adding FAQ section
- Add preview/demo section
- Consider adding blog/updates section

---

## Technical Implementation

### Rendering
- Content rendered via `ContentRenderer` with `prose: false`
- Uses MDC (Markdown Components) syntax
- Components are Nuxt UI prose components
- No custom prose styling (full component control)

### Performance
- Lazy loading for search component
- Client-only components where appropriate
- Optimized images via Nuxt Image

### Accessibility
- Semantic HTML structure
- Icon + text patterns
- Clear heading hierarchy
- Button labels with icons

---

## Next Steps for Analysis

1. **Analyze other pages** (companies, methodology, guides)
2. **Compare sectioning patterns** across pages
3. **Review component consistency**
4. **Check responsive behavior**
5. **Analyze conversion funnel** (hero → CTA flow)
