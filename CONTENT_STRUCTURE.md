# Content Structure & Location Guide

This document provides a comprehensive breakdown of all sections, locations, pages, and areas in the Applicants.io documentation site for the content team.

## Table of Contents
1. [Content Collections](#content-collections)
2. [Page Structure](#page-structure)
3. [Content Directory Structure](#content-directory-structure)
4. [Navigation Structure](#navigation-structure)
5. [Component Locations](#component-locations)
6. [Layout System](#layout-system)
7. [Route Mapping](#route-mapping)
8. [Special Features & Areas](#special-features--areas)

---

## Content Collections

The site uses five content collections defined in `content.config.ts`:

### 1. Landing Collection
- **Type**: Page
- **Source**: `content/index.md`
- **Purpose**: Homepage/landing page content
- **Route**: `/` (root)

### 2. Companies Collection
- **Type**: Page
- **Source**: `content/companies/**/*.md` (excludes `_template.md`)
- **Purpose**: Primary money pages - company risk assessments
- **Routes**: `/companies/company-slug`
- **Template**: `content/companies/_template.md`

### 3. Methodology Collection
- **Type**: Page
- **Source**: `content/methodology/**/*.md`
- **Purpose**: Trust anchor - explains how scoring works
- **Routes**: `/methodology/topic-slug`
- **Files**: `overview.md`, `risk-scoring.md`, `data-sources.md`, `limitations.md`

### 4. Guides Collection
- **Type**: Page
- **Source**: `content/guides/**/*.md`
- **Purpose**: Candidate education - one question per guide
- **Routes**: `/guides/guide-slug`
- **Examples**: `commission-only-jobs.md`, `unpaid-training.md`

### 5. Networks Collection
- **Type**: Page
- **Source**: `content/networks/**/*.md`
- **Purpose**: High-risk, high-authority content about recruiting networks
- **Routes**: `/networks/network-slug`
- **Example**: `smart-circle.md`

---

## Page Structure

### Page Files Location
- **Path**: `app/pages/`

### Available Pages

#### 1. Homepage (`index.vue`)
- **Location**: `app/pages/index.vue`
- **Route**: `/`
- **Content Source**: `content/index.md` (from `landing` collection)
- **Layout**: Default (no specific layout)
- **Features**: 
  - Renders landing page content
  - Uses ContentRenderer component
  - No prose styling (custom components)

#### 2. Dynamic Documentation Pages (`[...slug].vue`)
- **Location**: `app/pages/[...slug].vue`
- **Route**: All routes except `/` (e.g., `/getting-started`, `/essentials/markdown-syntax`)
- **Content Source**: Files from `docs` collection based on route path
- **Layout**: `docs` layout
- **Features**:
  - Page header with title, description, and headline
  - Content rendering with prose styling
  - Table of contents (right sidebar)
  - Previous/Next navigation (surround pages)
  - Page header links (copy, view markdown, etc.)
  - Edit page link (if configured)
  - Community links section

---

## Content Directory Structure

### Root Content Directory
- **Path**: `content/`

### Current Content Organization

```
content/
├── index.md                    # Landing page (homepage)
│
├── companies/                  # Collection: Companies
│   ├── .navigation.yml        # Navigation config: "Companies"
│   ├── .gitkeep
│   ├── _template.md           # Template for new company pages
│   └── [company-slug].md       # Individual company pages
│
├── methodology/               # Collection: Methodology
│   ├── .navigation.yml        # Navigation config: "How We Score"
│   ├── .gitkeep
│   ├── overview.md           # Methodology overview
│   ├── risk-scoring.md       # Risk scoring details
│   ├── data-sources.md       # Data sources explanation
│   └── limitations.md        # Methodology limitations
│
├── guides/                     # Collection: Guides
│   ├── .navigation.yml        # Navigation config: "Guides"
│   ├── .gitkeep
│   ├── commission-only-jobs.md
│   └── unpaid-training.md
│
└── networks/                   # Collection: Networks
    ├── .navigation.yml        # Navigation config: "Networks"
    ├── .gitkeep
    └── smart-circle.md
```

### Content File Naming Convention
- **Numbered prefixes** (e.g., `1.`, `2.`) control ordering within sections
- **Navigation order** is determined by file name sorting
- **Route paths** are generated from directory structure and file names

---

## Navigation Structure

### Navigation Configuration
- **Location**: `app/app.vue` (line 4)
- **Method**: `queryCollectionNavigation('docs')`
- **Display**: Left sidebar in docs layout

### Section Navigation Files
Each collection has a `.navigation.yml` file that configures the section title:

1. **Companies** (`content/companies/.navigation.yml`)
   - Title: "Companies"
   - Icon: false

2. **Methodology** (`content/methodology/.navigation.yml`)
   - Title: "How We Score"
   - Icon: false

3. **Guides** (`content/guides/.navigation.yml`)
   - Title: "Guides"
   - Icon: false

4. **Networks** (`content/networks/.navigation.yml`)
   - Title: "Networks"
   - Icon: false

### Navigation Features
- **Auto-generated** from all content collections
- **Multi-collection** navigation (companies, methodology, guides, networks)
- **Hierarchical** based on folder nesting
- **Highlighted** current page
- **Collapsible** sections
- **Search-enabled** (via UContentSearch component, searches all collections)

---

## Component Locations

### Main Application Components
- **Path**: `app/components/`

#### Core Components
- **AppHeader.vue**: Site header/navigation bar
  - Logo display
  - Search button
  - Color mode toggle
  - Header links
  - Navigation menu

- **AppFooter.vue**: Site footer
  - Credits text
  - Footer links
  - Color mode toggle (if enabled)

- **AppLogo.vue**: Logo component
  - Displays Applicants.io logo
  - Used in header

#### Content-Specific Components
- **PageHeaderLinks.vue**: Action buttons in page headers
  - Copy page content
  - View as Markdown
  - Open in ChatGPT/Claude
  - Dropdown menu for additional actions

- **TemplateMenu.vue**: Template selector dropdown
  - Shows available Nuxt templates
  - Currently set to "Docs" template

#### Content Display Components
- **content/HeroBackground.vue**: Hero section background SVG
  - Animated gradient background
  - Used on landing page

- **content/StarsBg.vue**: Stars background component
  - Animated stars effect

- **OgImage/OgImageDocs.vue**: Open Graph image component
  - Generates OG images for documentation pages

---

## Layout System

### Layouts Directory
- **Path**: `app/layouts/`

### Available Layouts

#### 1. Default Layout
- **Usage**: Homepage (`index.vue`)
- **Features**: Full-width content rendering

#### 2. Docs Layout (`docs.vue`)
- **Location**: `app/layouts/docs.vue`
- **Usage**: All documentation pages (via `[...slug].vue`)
- **Structure**:
  - **Left Sidebar**: Navigation menu (UContentNavigation)
  - **Main Content**: Page content area
  - **Right Sidebar**: Table of contents (when available)
- **Container**: Uses UContainer for responsive width

---

## Route Mapping

### Route Generation Rules

1. **Homepage**
   - File: `content/index.md`
   - Route: `/`
   - Collection: `landing`

2. **Company Pages**
   - Files: `content/companies/*.md` (except `_template.md`)
   - Routes: `/companies/company-slug`
   - Collection: `companies`
   - Examples:
     - `content/companies/valore-events.md` → `/companies/valore-events`

3. **Methodology Pages**
   - Files: `content/methodology/*.md`
   - Routes: `/methodology/topic-slug`
   - Collection: `methodology`
   - Examples:
     - `content/methodology/risk-scoring.md` → `/methodology/risk-scoring`

4. **Guide Pages**
   - Files: `content/guides/*.md`
   - Routes: `/guides/guide-slug`
   - Collection: `guides`
   - Examples:
     - `content/guides/commission-only-jobs.md` → `/guides/commission-only-jobs`

5. **Network Pages**
   - Files: `content/networks/*.md`
   - Routes: `/networks/network-slug`
   - Collection: `networks`
   - Examples:
     - `content/networks/smart-circle.md` → `/networks/smart-circle`

### Route Features
- **Automatic** route generation from file structure
- **Collection-based** routing (detects collection from path prefix)
- **Fallback** routing (tries all collections if path doesn't match)
- **404 handling** for non-existent pages
- **SEO meta tags** from frontmatter
- **No query params** - clean URLs only

---

## Special Features & Areas

### Search Functionality
- **Component**: LazyUContentSearch (in `app.vue`)
- **Location**: Header search button
- **Data Source**: Searches all collections (companies, methodology, guides, networks)
- **Features**: Full-text search across all content collections

### Page Metadata
Each content file can include:
- **SEO fields**: `title`, `description` (in frontmatter)
- **Page links**: Array of action buttons
- **Description**: Page description text
- **Title**: Page title

### Table of Contents
- **Location**: Right sidebar on documentation pages
- **Auto-generated**: From markdown headings
- **Config**: `app.config.ts` → `toc` section
- **Features**:
  - Title: "Table of Contents"
  - Bottom section: Community links
  - Edit page link (if configured)

### Page Surround Navigation
- **Feature**: Previous/Next page links
- **Location**: Bottom of documentation pages
- **Auto-generated**: Based on navigation order

### Raw Content Access
- **Server Route**: `/raw/[...slug].md`
- **Location**: `server/routes/raw/[...slug].md.get.ts`
- **Purpose**: Access raw markdown content
- **Use Case**: Copy page content, view source

### MCP Tools (Server)
- **Location**: `server/mcp/tools/`
- **Tools**:
  - `get-page.ts`: Retrieve page content
  - `list-pages.ts`: List all pages
- **Purpose**: AI/LLM integration for content access

---

## Content Editing Guidelines

### File Locations for Common Tasks

1. **Edit Homepage Content**
   - File: `content/index.md`

2. **Add New Company Page**
   - Location: `content/companies/`
   - Naming: Use kebab-case (e.g., `company-name.md`)
   - Template: Copy from `content/companies/_template.md`
   - Route: Auto-generated as `/companies/company-name`
   - Required: All 8 sections from template

3. **Add New Guide**
   - Location: `content/guides/`
   - Naming: Use kebab-case (e.g., `guide-topic.md`)
   - Structure: Definition → Mechanics → Warning Signs
   - Route: Auto-generated as `/guides/guide-topic`

4. **Add New Network Page**
   - Location: `content/networks/`
   - Naming: Use kebab-case (e.g., `network-name.md`)
   - Focus: Patterns and mechanics, not accusations
   - Route: Auto-generated as `/networks/network-name`

5. **Add Methodology Content**
   - Location: `content/methodology/`
   - Naming: Use kebab-case (e.g., `topic-name.md`)
   - Style: Deterministic, bullet-first
   - Route: Auto-generated as `/methodology/topic-name`

6. **Update Navigation**
   - Edit `.navigation.yml` in collection folder
   - Navigation auto-generates from file structure

5. **Update Site Metadata**
   - Site name: `app/app.config.ts` → `seo.siteName`
   - Footer credits: `app/app.config.ts` → `footer.credits`
   - Header links: `app/app.config.ts` → `header.links`
   - Footer links: `app/app.config.ts` → `footer.links`

6. **Update Table of Contents Settings**
   - File: `app/app.config.ts` → `toc` section

---

## Key Configuration Files

1. **Content Configuration**: `content.config.ts`
   - Defines content collections
   - Sets up content schemas

2. **App Configuration**: `app/app.config.ts`
   - UI colors and themes
   - Header/footer settings
   - SEO settings
   - Table of contents config

3. **Nuxt Configuration**: `nuxt.config.ts`
   - Module configuration
   - Content module settings
   - LLM/MCP settings

4. **Main Stylesheet**: `app/assets/css/main.css`
   - Global styles
   - Color system
   - Glassmorphism utilities
   - Gradient definitions

---

## Summary

- **Content Files**: Located in `content/` directory
- **Page Components**: Located in `app/pages/`
- **Layouts**: Located in `app/layouts/`
- **Components**: Located in `app/components/`
- **Navigation**: Auto-generated from content structure + `.navigation.yml` files
- **Routes**: Auto-generated from file paths
- **Search**: Enabled via header search button
- **TOC**: Auto-generated from markdown headings

All documentation content should be added to the `content/` directory following the existing structure and naming conventions.

