// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    'nuxt-seo-experiments',
    'nuxt-link-checker',
    '@nuxtjs/seo',
    'nuxt-jsonld',
    'nuxt-vitalizer',
    // '@netsells/nuxt-hotjar', // Temporarily disabled - needs proper config
    'nuxt-feedme'
    // '@nuxtjs/feed' // Removed - incompatible with Nuxt 4, using nuxt-feedme instead
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/',
        '/about',
        '/companies'
      ],
      crawlLinks: true,
      failOnError: false,
      autoSubfolderIndex: false
    },
    // Ensure unhead and related packages are bundled (not externalized)
    // This prevents ERR_MODULE_NOT_FOUND at runtime in production
    inline: [
      'unhead',
      '@unhead/vue',
      '@unhead/addons',
      '@unhead/schema-org'
    ],
    // Explicitly exclude unhead packages from externals to force bundling
    // Returning false means "don't externalize" = bundle it
    externals: (id: string) => {
      // Don't externalize unhead packages - force them to be bundled
      if (id === 'unhead' || id.startsWith('@unhead/')) {
        return false
      }
      // Let Nitro handle other externals with default behavior
      return undefined
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },

  llms: {
    domain: 'https://applicants.io/',
    title: 'Applicants.io',
    description: 'Candidate intelligence platform for evaluating job opportunities.',
    full: {
      title: 'Applicants.io - Candidate Intelligence Platform',
      description: 'Evidence-based risk assessments and analysis of company recruiting patterns.'
    },
    sections: [
      {
        title: 'Companies',
        contentCollection: 'companies',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/companies%' }
        ]
      },
      {
        title: 'Methodology',
        contentCollection: 'methodology',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/methodology%' }
        ]
      },
      {
        title: 'Guides',
        contentCollection: 'guides',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/guides%' }
        ]
      },
      {
        title: 'Networks',
        contentCollection: 'networks',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/networks%' }
        ]
      }
    ]
  },

  mcp: {
    name: 'Applicants.io'
  },

  site: {
    url: process.env.SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://applicants.io'
  },
  
  sitemap: {
    hostname: process.env.SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://applicants.io'
  },

  feedme: {
    content: {
      collections: [
        'companies',
        'guides',
        'methodology',
        'networks'
      ]
    }
  },

  // hotjar: {
  //   id: process.env.HOTJAR_ID || null,
  //   sv: process.env.HOTJAR_SV || null,
  //   dev: process.env.NODE_ENV === 'development'
  // },

  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL || 'https://applicants.io'
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
