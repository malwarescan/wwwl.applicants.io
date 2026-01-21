import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    landing: defineCollection({
      type: 'page',
      source: 'index.md'
    }),
    companies: defineCollection({
      type: 'page',
      source: {
        include: 'companies/**/*.md',
        exclude: ['companies/_template.md', 'companies/_company-template.md']
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        headline: z.string().optional(),
        slug: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().url().optional(),
        hq: z.string().optional(),
        operating_regions: z.array(z.string()).optional(),
        known_aliases: z.array(z.string()).optional(),
        last_updated: z.string().optional(),
        risk_score: z.object({
          total: z.number().min(0).max(100),
          confidence: z.number().min(0).max(1),
          subscores: z.object({
            wage_payment: z.number().min(0).max(100).optional(),
            misrepresentation: z.number().min(0).max(100).optional(),
            churn_pressure: z.number().min(0).max(100).optional(),
            recruitment_funnel: z.number().min(0).max(100).optional(),
            legal_threats: z.number().min(0).max(100).optional(),
            identity_obfuscation: z.number().min(0).max(100).optional(),
            review_pattern_anomaly: z.number().min(0).max(100).optional()
          }).optional()
        }).optional(),
        evidence: z.array(z.object({
          id: z.string(),
          claim: z.string(),
          source_name: z.string(),
          source_type: z.enum(['glassdoor', 'indeed', 'reddit', 'bbb', 'linkedin', 'news', 'court', 'other']),
          url: z.string().url(),
          date_captured: z.string(),
          excerpt: z.string().optional(),
          credibility: z.number().min(0).max(1)
        })).optional(),
        faqs: z.array(z.object({
          q: z.string(),
          a: z.string()
        })).optional(),
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    }),
    methodology: defineCollection({
      type: 'page',
      source: {
        include: 'methodology/**/*.md'
      },
      schema: z.object({
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    }),
    guides: defineCollection({
      type: 'page',
      source: {
        include: 'guides/**/*.md'
      },
      schema: z.object({
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    }),
    networks: defineCollection({
      type: 'page',
      source: {
        include: 'networks/**/*.md'
      },
      schema: z.object({
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    }),
    pages: defineCollection({
      type: 'page',
      source: {
        include: '*.md',
        exclude: ['index.md']
      },
      schema: z.object({
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    }),
    entities: defineCollection({
      type: 'page',
      source: 'entities/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        headline: z.string().optional(),
        slug: z.string().optional(),
        jobTitle: z.string().optional(),
        worksFor: z.object({
          '@type': z.literal('Organization'),
          name: z.string(),
          url: z.string().url()
        }).optional(),
        url: z.string().url().optional(),
        '@id': z.string().url().optional(),
        sameAs: z.array(z.string().url()).optional(),
        knowsAbout: z.array(z.string().url()).optional(),
        seo: z.object({
          title: z.string(),
          description: z.string()
        }).optional()
      })
    })
  }
})
