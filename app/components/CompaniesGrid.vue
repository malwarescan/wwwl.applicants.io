<script setup lang="ts">
interface Company {
  title: string
  slug?: string
  path: string
  risk_score?: {
    total: number
    confidence?: number
  }
  description?: string
  industry?: string
}

const props = defineProps<{
  companies: Company[]
}>()

function getRiskBand(score: number): { label: string; color: string; spotlightColor: string } {
  if (score >= 80) {
    return {
      label: 'Severe',
      color: 'text-red-600 dark:text-red-400',
      spotlightColor: 'rgba(239, 68, 68, 0.2)'
    }
  }
  if (score >= 60) {
    return {
      label: 'High',
      color: 'text-orange-600 dark:text-orange-400',
      spotlightColor: 'rgba(251, 146, 60, 0.2)'
    }
  }
  if (score >= 40) {
    return {
      label: 'Elevated',
      color: 'text-yellow-600 dark:text-yellow-400',
      spotlightColor: 'rgba(234, 179, 8, 0.2)'
    }
  }
  if (score >= 20) {
    return {
      label: 'Guarded',
      color: 'text-blue-600 dark:text-blue-400',
      spotlightColor: 'rgba(59, 130, 246, 0.2)'
    }
  }
  return {
    label: 'Low',
    color: 'text-green-600 dark:text-green-400',
    spotlightColor: 'rgba(34, 197, 94, 0.2)'
  }
}

function getCompanyUrl(path: string): string {
  return path.startsWith('/') ? path : `/companies/${path}`
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <SpotlightCard
      v-for="company in companies"
      :key="company.path"
      :spotlight-color="company.risk_score ? getRiskBand(company.risk_score.total).spotlightColor : 'rgba(99, 102, 241, 0.2)'"
      class="h-full"
    >
      <NuxtLink
        :to="getCompanyUrl(company.path)"
        class="block h-full p-6 hover:opacity-90 transition-opacity"
      >
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex-1">
            {{ company.title }}
          </h3>
          <RiskBadge
            v-if="company.risk_score"
            :score="company.risk_score.total"
            size="sm"
          />
        </div>

        <div
          v-if="company.risk_score"
          class="mb-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium" :class="getRiskBand(company.risk_score.total).color">
              {{ getRiskBand(company.risk_score.total).label }} Risk
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              ({{ company.risk_score.total }}/100)
            </span>
          </div>
        </div>

        <p
          v-if="company.description"
          class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4"
        >
          {{ company.description }}
        </p>

        <div
          v-if="company.industry"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ company.industry }}
        </div>

        <div class="mt-4 flex items-center text-sm text-primary font-medium">
          View Details
          <Icon name="i-lucide-arrow-right" class="ml-1 w-4 h-4" />
        </div>
      </NuxtLink>
    </SpotlightCard>
  </div>
</template>

