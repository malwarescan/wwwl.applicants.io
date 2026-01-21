/**
 * JSON-LD schema generation for SEO/AEO/GEO optimization.
 * Generates structured data blocks for company pages and other content.
 */

export interface CompanyPageData {
  title: string
  description: string
  slug: string
  website?: string
  known_aliases?: string[]
  operating_regions?: string[]
  last_updated?: string
  risk_score?: {
    total: number
    confidence: number
    subscores: Record<string, number>
  }
  evidence?: Array<{
    id: string
    claim: string
    source_name: string
    source_type: string
    url: string
    date_captured: string
    credibility: number
  }>
  faqs?: Array<{
    q: string
    a: string
  }>
}

const SITE_URL = 'https://applicants.io'

/**
 * Generate WebPage schema with BreadcrumbList
 */
export function generateWebPageSchema(data: CompanyPageData) {
  const url = `${SITE_URL}/companies/${data.slug}`
  
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.description,
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Applicants.io',
        url: SITE_URL
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Companies',
          item: `${SITE_URL}/companies`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.title,
          item: url
        }
      ]
    }
  ]
}

/**
 * Generate Organization schema (only if website or official name confidence exists)
 */
export function generateOrganizationSchema(data: CompanyPageData) {
  if (!data.website && (!data.known_aliases || data.known_aliases.length === 0)) {
    return null
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.title
  }

  if (data.website) {
    schema.url = data.website
  }

  if (data.known_aliases && data.known_aliases.length > 0) {
    schema.alternateName = data.known_aliases
  }

  if (data.operating_regions && data.operating_regions.length > 0) {
    schema.areaServed = data.operating_regions.map(region => ({
      '@type': 'Country',
      name: region
    }))
  }

  return schema
}

/**
 * Generate Dataset schema for evidence
 */
export function generateDatasetSchema(data: CompanyPageData) {
  if (!data.evidence || data.evidence.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Evidence for ${data.title} risk score`,
    description: `Source-indexed evidence items used to derive the risk score for ${data.title}.`,
    url: `${SITE_URL}/companies/${data.slug}#evidence-table`,
    creator: {
      '@type': 'Organization',
      name: 'Applicants.io'
    },
    dateModified: data.last_updated || new Date().toISOString().split('T')[0],
    variableMeasured: [
      'wage_payment',
      'misrepresentation',
      'churn_pressure',
      'recruitment_funnel',
      'legal_threats',
      'identity_obfuscation',
      'review_pattern_anomaly'
    ]
  }
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(data: CompanyPageData) {
  if (!data.faqs || data.faqs.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  }
}

/**
 * Generate all schemas for a company page
 */
export function generateCompanySchemas(data: CompanyPageData) {
  const schemas: any[] = []
  
  // Always include WebPage and BreadcrumbList
  schemas.push(...generateWebPageSchema(data))
  
  // Conditionally include Organization
  const orgSchema = generateOrganizationSchema(data)
  if (orgSchema) {
    schemas.push(orgSchema)
  }
  
  // Conditionally include Dataset (if evidence exists)
  const datasetSchema = generateDatasetSchema(data)
  if (datasetSchema) {
    schemas.push(datasetSchema)
  }
  
  // Conditionally include FAQPage (if FAQs exist)
  const faqSchema = generateFAQSchema(data)
  if (faqSchema) {
    schemas.push(faqSchema)
  }
  
  return schemas
}

/**
 * Person/Entity schema data interface
 */
export interface EntityPageData {
  title: string
  description: string
  slug: string
  jobTitle?: string
  worksFor?: {
    '@type': 'Organization'
    name: string
    url: string
  }
  url?: string
  '@id'?: string
  sameAs?: string[]
  knowsAbout?: string[]
}

/**
 * Generate Person schema for entity authority pages
 * This establishes entity reconciliation across multiple sites for Google Knowledge Panel
 */
export function generatePersonSchema(data: EntityPageData) {
  const pageUrl = `${SITE_URL}/entities/${data.slug}`
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.title,
    description: data.description
  }

  // Use the @id field as the unique entity identifier (critical for entity reconciliation)
  if (data['@id']) {
    schema['@id'] = data['@id']
  } else {
    // Fallback to the page URL if @id not specified
    schema['@id'] = pageUrl
  }

  // Primary URL for the entity (the "Entity Home")
  if (data.url) {
    schema.url = data.url
  } else {
    schema.url = pageUrl
  }

  // Job title and organization (worksFor)
  if (data.jobTitle) {
    schema.jobTitle = data.jobTitle
  }

  if (data.worksFor) {
    schema.worksFor = {
      '@type': data.worksFor['@type'],
      name: data.worksFor.name,
      url: data.worksFor.url
    }
  }

  // sameAs array creates verification loop across social profiles and other sites
  if (data.sameAs && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs
  }

  // knowsAbout for expertise areas (E-E-A-T signals)
  if (data.knowsAbout && data.knowsAbout.length > 0) {
    schema.knowsAbout = data.knowsAbout
  }

  return schema
}

/**
 * Generate WebPage schema for entity pages
 */
export function generateEntityWebPageSchema(data: EntityPageData) {
  const url = `${SITE_URL}/entities/${data.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Applicants.io',
      url: SITE_URL
    },
    mainEntity: {
      '@type': 'Person',
      name: data.title
    }
  }
}

/**
 * Generate all schemas for an entity page
 */
export function generateEntitySchemas(data: EntityPageData) {
  const schemas: any[] = []
  
  // Person schema (primary entity schema)
  schemas.push(generatePersonSchema(data))
  
  // WebPage schema with mainEntity reference
  schemas.push(generateEntityWebPageSchema(data))
  
  return schemas
}

