<script setup lang="ts">
definePageMeta({
  layout: 'docs'
})

// Fetch all companies (exclude index and templates)
const { data: companies } = await useAsyncData('companies-list', async () => {
  const allCompanies = await queryCollection('companies')
    .where({ 
      slug: { $ne: null },
      path: { $ne: '/companies/index' }
    })
    .find()

  // Sort by risk score (highest first), then by last_updated
  const sorted = allCompanies.sort((a, b) => {
    const scoreA = a.risk_score?.total || 0
    const scoreB = b.risk_score?.total || 0
    if (scoreA !== scoreB) return scoreB - scoreA
    const dateA = a.last_updated ? new Date(a.last_updated).getTime() : 0
    const dateB = b.last_updated ? new Date(b.last_updated).getTime() : 0
    return dateB - dateA
  })

  return sorted.map(company => ({
    title: company.title || '',
    slug: company.slug,
    path: company.path || `/companies/${company.slug}`,
    risk_score: company.risk_score,
    description: company.description,
    industry: company.industry
  }))
})

const title = 'Company Reviews & Risk Scores'
const description = 'Browse company reviews, risk assessments, and evidence-based analysis. Find risk scores, hiring patterns, and compensation structures.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
      headline="Companies"
    />

    <UPageBody>
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Risk Band Definitions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              Low (0-19)
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              Few risk signals found
            </div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              Guarded (20-39)
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              Mixed reports, verify details
            </div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
              Elevated (40-59)
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              Repeated patterns, proceed carefully
            </div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
              High (60-79)
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              Strong multi-source patterns
            </div>
          </div>
          <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
              Severe (80-100)
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              Consistent high-risk signals
            </div>
          </div>
        </div>
      </div>

      <div v-if="companies && companies.length > 0">
        <h2 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Companies
        </h2>
        <CompaniesGrid :companies="companies" />
      </div>

      <div
        v-else
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        <p class="mb-2">No companies found.</p>
        <p class="text-sm">Check back regularly for updates.</p>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Related Guides
        </h2>
        <div class="flex flex-wrap gap-4">
          <UButton
            to="/guides/commission-only-jobs"
            variant="outline"
            color="neutral"
          >
            What are commission-only jobs?
          </UButton>
          <UButton
            to="/guides/unpaid-training"
            variant="outline"
            color="neutral"
          >
            Unpaid training in employment
          </UButton>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>

