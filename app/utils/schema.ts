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

