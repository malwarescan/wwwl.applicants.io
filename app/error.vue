<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.'
})

const { data: navigation } = await useAsyncData('navigation', async () => {
  const [companies, methodology, guides, networks] = await Promise.all([
    queryCollectionNavigation('companies'),
    queryCollectionNavigation('methodology'),
    queryCollectionNavigation('guides'),
    queryCollectionNavigation('networks')
  ])
  return [...(companies || []), ...(methodology || []), ...(guides || []), ...(networks || [])]
})
const { data: files } = useLazyAsyncData('search', async () => {
  const [companies, methodology, guides, networks] = await Promise.all([
    queryCollectionSearchSections('companies'),
    queryCollectionSearchSections('methodology'),
    queryCollectionSearchSections('guides'),
    queryCollectionSearchSections('networks')
  ])
  return [...(companies || []), ...(methodology || []), ...(guides || []), ...(networks || [])]
}, {
  server: false
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <AppHeader />

    <UError :error="error" />

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
