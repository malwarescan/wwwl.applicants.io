<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const toast = useToast()
const { copy, copied } = useClipboard()
const site = useSiteConfig()

const mdPath = computed(() => `${site.url}/raw${route.path}.md`)

const items = [
  {
    label: 'Share this page',
    icon: 'i-lucide-share-2',
    onSelect() {
      copy(window.location.href)
      toast.add({
        title: 'Link copied to clipboard',
        icon: 'i-lucide-check-circle'
      })
    }
  }
]

async function sharePage() {
  copy(window.location.href)
  toast.add({
    title: 'Link copied to clipboard',
    icon: 'i-lucide-check-circle'
  })
}
</script>

<template>
  <UFieldGroup>
    <UButton
      label="Share"
      :icon="copied ? 'i-lucide-check' : 'i-lucide-share-2'"
      color="neutral"
      variant="outline"
      :ui="{
        leadingIcon: [copied ? 'text-primary' : 'text-neutral', 'size-3.5']
      }"
      @click="sharePage"
    />
    <UDropdownMenu
      :items="items"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8
      }"
      :ui="{
        content: 'w-48'
      }"
    >
      <UButton
        icon="i-lucide-chevron-down"
        size="sm"
        color="neutral"
        variant="outline"
        aria-label="Open copy actions menu"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
