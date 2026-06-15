<script lang="ts" setup>
import defaultLargePng from '@/assets/images/e/instruction/how-to-activate-gift-code/hero-large@2x.png'
import defaultMediumPng from '@/assets/images/e/instruction/how-to-activate-gift-code/hero-medium@2x.png'
import defaultSmallPng from '@/assets/images/e/instruction/how-to-activate-gift-code/hero-small@2x.png'

const props = defineProps<{ path?: string, name?: string, onlyOne?: boolean }>()

// 1. Сканируем ВСЮ папку картинок статическим литералом (без переменных в путях!)
// Поднимаемся на тот уровень, откуда начинается динамика (например, до /assets/images/)
const PNG_L = import.meta.glob('/assets/images/**/*-large@2x.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_M = import.meta.glob('/assets/images/**/*-medium@2x.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_S = import.meta.glob('/assets/images/**/*-small@2x.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_A = import.meta.glob('/assets/images/**/*@2x.png', { eager: true, as: 'url' }) as Record<string, string>

const WEBP_L = import.meta.glob('/assets/images/**/*-large@2x.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_M = import.meta.glob('/assets/images/**/*-medium@2x.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_S = import.meta.glob('/assets/images/**/*-small@2x.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_A = import.meta.glob('/assets/images/**/*@2x.webp', { eager: true, as: 'url' }) as Record<string, string>

// 2. В рантайме собираем ключ для поиска в считанной карте
const base = computed(() => `/assets/images/${props.path}`)

const largePng = computed(() => PNG_L[`${base.value}/${props.name}-large@2x.png`] ?? defaultLargePng)
const mediumPng = computed(() => PNG_M[`${base.value}/${props.name}-medium@2x.png`] ?? defaultMediumPng)
const smallPng = computed(() => PNG_S[`${base.value}/${props.name}-small@2x.png`] ?? defaultSmallPng)
const allPng = computed(() => PNG_A[`${base.value}/${props.name}@2x.png`] ?? defaultLargePng)

const largeWebp = computed(() => WEBP_L[`${base.value}/${props.name}-large@2x.webp`])
const mediumWebp = computed(() => WEBP_M[`${base.value}/${props.name}-medium@2x.webp`])
const smallWebp = computed(() => WEBP_S[`${base.value}/${props.name}-small@2x.webp`])
const allWebp = computed(() => WEBP_A[`${base.value}/${props.name}@2x.webp`])
</script>

<template>
  <picture
    v-if="!onlyOne"
    class="image"
  >
    <!-- >=1024: webp -> png -->
    <source
      v-if="largeWebp"
      :srcset="largeWebp"
      type="image/webp"
      media="(min-width: 1024px)"
    >
    <source
      :srcset="largePng"
      type="image/png"
      media="(min-width: 1024px)"
    >

    <!-- 844–1023: webp -> png -->
    <source
      v-if="mediumWebp"
      :srcset="mediumWebp"
      type="image/webp"
      media="(min-width: 844px)"
    >
    <source
      :srcset="mediumPng"
      type="image/png"
      media="(min-width: 844px)"
    >

    <!-- <844: webp -> png -->
    <source
      v-if="smallWebp"
      :srcset="smallWebp"
      type="image/webp"
    >
    <!-- Финальный фолбек: <img> всегда PNG, чтобы без undefined -->
    <img
      :src="smallPng"
      :alt="props.name || ''"
    >
  </picture>

  <picture
    v-else
    class="image"
  >
    <!-- <844: webp -> png -->
    <source
      :srcset="allWebp"
      type="image/webp"
    >
    <!-- Финальный фолбек: <img> всегда PNG, чтобы без undefined -->
    <img
      :src="allPng"
      :alt="props.name || ''"
    >
  </picture>
</template>
