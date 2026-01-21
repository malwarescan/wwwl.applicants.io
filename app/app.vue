<script setup lang="ts">
const { seo } = useAppConfig()

// Build navigation from all collections
const { data: navigation } = await useAsyncData('navigation', async () => {
  const [companies, methodology, guides, networks, entities] = await Promise.all([
    queryCollectionNavigation('companies'),
    queryCollectionNavigation('methodology'),
    queryCollectionNavigation('guides'),
    queryCollectionNavigation('networks'),
    queryCollectionNavigation('entities')
  ])
  
  return [
    ...(companies || []),
    ...(methodology || []),
    ...(guides || []),
    ...(networks || []),
    ...(entities || [])
  ]
})

const { data: files } = useLazyAsyncData('search', async () => {
  const [companies, methodology, guides, networks, entities] = await Promise.all([
    queryCollectionSearchSections('companies'),
    queryCollectionSearchSections('methodology'),
    queryCollectionSearchSections('guides'),
    queryCollectionSearchSections('networks'),
    queryCollectionSearchSections('entities')
  ])
  
  return [
    ...(companies || []),
    ...(methodology || []),
    ...(guides || []),
    ...(networks || []),
    ...(entities || [])
  ]
}, {
  server: false
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/favicon.ico' }
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
