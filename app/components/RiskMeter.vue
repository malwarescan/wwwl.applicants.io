<script setup lang="ts">
interface Props {
  score: number
  confidence: number
  showLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabels: true
})

// Clamp score to 0-100
const clampedScore = computed(() => Math.max(0, Math.min(100, props.score)))

// Determine risk band color
const riskColor = computed(() => {
  if (clampedScore.value >= 80) return 'bg-red-500'
  if (clampedScore.value >= 60) return 'bg-orange-500'
  if (clampedScore.value >= 40) return 'bg-yellow-500'
  if (clampedScore.value >= 20) return 'bg-blue-500'
  return 'bg-green-500'
})

// Confidence label
const confidenceLabel = computed(() => {
  if (props.confidence >= 0.8) return 'High confidence'
  if (props.confidence >= 0.6) return 'Moderate confidence'
  if (props.confidence >= 0.4) return 'Limited confidence'
  return 'Low confidence'
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold">{{ clampedScore }}</span>
        <span class="text-sm text-muted">/ 100</span>
      </div>
      <span
        v-if="showLabels"
        class="text-xs text-muted"
      >
        {{ confidenceLabel }}
      </span>
    </div>
    
    <!-- Meter bar -->
    <div class="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        :class="[riskColor, 'h-full transition-all duration-300']"
        :style="{ width: `${clampedScore}%` }"
      />
    </div>
    
    <!-- Confidence indicator (optional) -->
    <div
      v-if="showLabels && confidence < 1.0"
      class="text-xs text-muted"
    >
      Confidence: {{ Math.round(confidence * 100) }}%
    </div>
  </div>
</template>

