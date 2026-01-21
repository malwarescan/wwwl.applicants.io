<script setup lang="ts">
import type { ContentNavigationItem, Collections } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'
import { generateCompanySchemas, generateEntitySchemas } from '~/utils/schema'

definePageMeta({
  layout: 'docs'
})

// Determine collection based on route path
function getCollectionFromPath(path: string): string | null {
  if (path.startsWith('/companies/')) return 'companies'
  if (path.startsWith('/methodology/')) return 'methodology'
  if (path.startsWith('/guides/')) return 'guides'
  if (path.startsWith('/networks/')) return 'networks'
  if (path.startsWith('/entities/')) return 'entities'
  return null
}

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://applicants.io'

const { data: page } = await useAsyncData(route.path, async () => {
  // Try the determined collection first
  const preferredCollection = getCollectionFromPath(route.path)
  if (preferredCollection) {
    const page = await queryCollection(preferredCollection as keyof Collections).path(route.path).first()
    if (page) return page
  }
  
  // If not found, try all collections
  const collections = ['companies', 'methodology', 'guides', 'networks', 'entities'] as Array<keyof Collections>
  for (const coll of collections) {
    const page = await queryCollection(coll).path(route.path).first()
    if (page) return page
  }
  
  return null
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, async () => {
  // Use the same collection as the page for surround navigation
  const preferredCollection = getCollectionFromPath(route.path)
  if (preferredCollection) {
    try {
      const result = await queryCollectionItemSurroundings(preferredCollection as any, route.path, {
        fields: ['description']
      })
      if (result && result.length > 0) return result
    } catch {
      // Continue to try other collections
    }
  }
  
  // Try other collections if preferred didn't work
  const collections = ['companies', 'methodology', 'guides', 'networks', 'entities'] as Array<keyof Collections>
  for (const coll of collections) {
    if (coll === preferredCollection) continue
    try {
      const result = await queryCollectionItemSurroundings(coll, route.path, {
        fields: ['description']
      })
      if (result && result.length > 0) return result
    } catch {
      // Continue to next collection
    }
  }
  return null
})

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description
// Ensure canonical URL has no trailing slash (except root)
const canonicalUrl = `${siteUrl}${route.path === '/' ? '' : route.path.replace(/\/$/, '')}`

// Generate JSON-LD schemas for company pages and entity pages
const jsonLdSchemas = computed(() => {
  if (route.path.startsWith('/companies/') && page.value) {
    const p = page.value as any
    const companyData = {
      title: p.title || '',
      description: p.description || '',
      slug: p.slug || route.path.split('/').pop() || '',
      website: p.website,
      known_aliases: p.known_aliases,
      operating_regions: p.operating_regions,
      last_updated: p.last_updated,
      risk_score: p.risk_score,
      evidence: p.evidence,
      faqs: p.faqs
    }
    return generateCompanySchemas(companyData)
  }
  
  if (route.path.startsWith('/entities/') && page.value) {
    const p = page.value as any
    const entityData = {
      title: p.title || '',
      description: p.description || '',
      slug: p.slug || route.path.split('/').pop() || '',
      jobTitle: p.jobTitle,
      worksFor: p.worksFor,
      url: p.url,
      '@id': p['@id'],
      sameAs: p.sameAs,
      knowsAbout: p.knowsAbout
    }
    return generateEntitySchemas(entityData)
  }
  
  return []
})

// Add canonical link and JSON-LD schemas to head
// JSON-LD must be server-rendered for SEO
const headScripts = computed(() => {
  if (!jsonLdSchemas.value || jsonLdSchemas.value.length === 0) {
    return []
  }
  return jsonLdSchemas.value.map((schema, index) => ({
    type: 'application/ld+json',
    innerHTML: JSON.stringify(schema),
    key: `schema-${index}-${route.path}`
  }))
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ],
  script: headScripts
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image'
})

const headline = computed(() => {
  const nav = navigation?.value
  if (!nav || !Array.isArray(nav)) return undefined
  return findPageHeadline(nav, page.value?.path)
})

// Use Docs component (nuxt-og-image auto-discovers OgImageDocs.vue from OgImage/ directory as 'Docs')
if (headline.value && title && description) {
  defineOgImageComponent('Docs', {
    headline: headline.value,
    title: title,
    description: description
  })
}

const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :headline="headline"
    >
      <template #links>
        <UButton
          v-for="(link, index) in ((page as any).links || [])"
          :key="index"
          v-bind="link"
        />

        <PageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround || undefined" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :title="toc?.title"
        :links="page.body?.toc?.links"
      >
        <template
          v-if="toc?.bottom"
          #bottom
        >
          <div
            class="hidden lg:block space-y-6"
            :class="{ '!mt-6': page.body?.toc?.links?.length }"
          >
            <USeparator
              v-if="page.body?.toc?.links?.length"
              type="dashed"
            />

            <UPageLinks
              :title="toc.bottom.title"
              :links="links"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
