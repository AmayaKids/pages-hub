<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const items = [
    { label: 'Главная', to: '/' }
  ]

  if (route.meta.title) {
    items.push({ label: route.meta.title as string, to: route.path })
  }

  return items
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<style>
html, body {
  /* Запрещает "отскок" всей страницы */
  overscroll-behavior: none;
  /* Для Safari/iOS также полезно зафиксировать высоту */
  height: 100%;
  overflow: hidden;
}
</style>
