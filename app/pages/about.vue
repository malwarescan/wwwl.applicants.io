<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

definePageMeta({
  layout: 'docs'
})

const { data: page } = await useAsyncData('about', async () => {
  // Try pages collection first (about.md is in the pages collection)
  try {
    const pages = await queryCollection('pages').find()
    const aboutPage = pages.find(p => p._path === '/about' || p.path === '/about')
    if (aboutPage) return aboutPage
  } catch (e) {
    // Continue to fallback
  }
  
  // Try queryContent with different paths
  try {
    const contentPage = await queryContent<ParsedContent>('/about').findOne()
    if (contentPage) return contentPage
  } catch (e) {
    // Continue to next fallback
  }
  
  // Try without leading slash
  try {
    return await queryContent<ParsedContent>('about').findOne()
  } catch (e) {
    return null
  }
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title || 'About Applicants.io'
const description = page.value.seo?.description || page.value.description || ''
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://applicants.io'
const canonicalUrl = `${siteUrl}/about`

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl
    }
  ]
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      headline="About"
    />

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />
    </UPageBody>
  </UPage>
</template>

