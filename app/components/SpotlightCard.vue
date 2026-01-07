<script setup lang="ts">
interface Props {
  spotlightColor?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  spotlightColor: 'rgba(99, 102, 241, 0.2)',
  className: ''
})

const cardRef = ref<HTMLElement>()

function handleMouseMove(e: MouseEvent) {
  if (!cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  cardRef.value.style.setProperty('--mouse-x', `${x}px`)
  cardRef.value.style.setProperty('--mouse-y', `${y}px`)
  cardRef.value.style.setProperty('--spotlight-color', props.spotlightColor)
}
</script>

<template>
  <div
    ref="cardRef"
    class="card-spotlight"
    :class="className"
    @mousemove="handleMouseMove"
  >
    <slot />
  </div>
</template>

<style scoped>
.card-spotlight {
  position: relative;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-spotlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--spotlight-color, rgba(99, 102, 241, 0.2)),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.card-spotlight:hover::before {
  opacity: 1;
}

.card-spotlight > * {
  position: relative;
  z-index: 2;
}

/* Dark mode adjustments */
.dark .card-spotlight {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>

