<script setup lang="ts">
interface Props {
  score: number
  confidence?: number
  showMeter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confidence: 1.0,
  showMeter: true
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <RiskBadge :score="score" size="lg" />
      <span class="text-lg font-semibold">{{ score }} / 100</span>
      <span
        v-if="confidence < 1.0"
        class="text-sm text-muted"
      >
        ({{ Math.round(confidence * 100) }}% confidence)
      </span>
    </div>
    <RiskMeter
      v-if="showMeter"
      :score="score"
      :confidence="confidence"
    />
  </div>
</template>





