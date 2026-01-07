<script setup lang="ts">
const { seo } = useAppConfig()

// Build navigation from all collections
const { data: navigation } = await useAsyncData('navigation', async () => {
  const [companies, methodology, guides, networks] = await Promise.all([
    queryCollectionNavigation('companies'),
    queryCollectionNavigation('methodology'),
    queryCollectionNavigation('guides'),
    queryCollectionNavigation('networks')
  ])
  
  return [
    ...(companies || []),
    ...(methodology || []),
    ...(guides || []),
    ...(networks || [])
  ]
})

const { data: files } = useLazyAsyncData('search', async () => {
  const [companies, methodology, guides, networks] = await Promise.all([
    queryCollectionSearchSections('companies'),
    queryCollectionSearchSections('methodology'),
    queryCollectionSearchSections('guides'),
    queryCollectionSearchSections('networks')
  ])
  
  return [
    ...(companies || []),
    ...(methodology || []),
    ...(guides || []),
    ...(networks || [])
  ]
}, {
  server: false
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: `%s - ${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  twitterCard: 'summary_large_image'
})

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
