<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
}>()

useSeoMeta({
  title: () => props.title
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-8">
    <div class="text-center">
      <h1 class="text-3xl font-semibold">
        {{ title }}
      </h1>
      <p class="mt-2 text-muted">
        {{ description }}
      </p>
    </div>
  </div>
</template>
