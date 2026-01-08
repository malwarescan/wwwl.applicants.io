<script setup lang="ts">
interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

// Determine risk band from score
const riskBand = computed(() => {
  if (props.score >= 80) return { label: 'Severe', color: 'red' }
  if (props.score >= 60) return { label: 'High', color: 'orange' }
  if (props.score >= 40) return { label: 'Elevated', color: 'yellow' }
  if (props.score >= 20) return { label: 'Guarded', color: 'blue' }
  return { label: 'Low', color: 'green' }
})

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
}

const colorClasses = {
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      sizeClasses[size],
      colorClasses[riskBand.color]
    ]"
  >
    {{ riskBand.label }}
  </span>
</template>





