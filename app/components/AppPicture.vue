<script lang="ts" setup>
import defaultLargePng from '@/assets/images/a/instruction/how-to-activate-gift-code/hero-large@2x.png'
import defaultMediumPng from '@/assets/images/a/instruction/how-to-activate-gift-code/hero-medium@2x.png'
import defaultSmallPng from '@/assets/images/a/instruction/how-to-activate-gift-code/hero-small@2x.png'

const props = defineProps<{ path?: string, name?: string, onlyOne?: boolean, onlyWebp?: boolean, only1x?: boolean }>()

// --- PNG: 1x и 2x, по размерам и общий (для onlyOne) ---
const PNG_L_1X = import.meta.glob('/assets/images/**/*-large.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_L_2X = import.meta.glob('/assets/images/**/*-large@2x.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_M_1X = import.meta.glob('/assets/images/**/*-medium.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_M_2X = import.meta.glob('/assets/images/**/*-medium@2x.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_S_1X = import.meta.glob('/assets/images/**/*-small.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_S_2X = import.meta.glob('/assets/images/**/*-small@2x.png', { eager: true, as: 'url' }) as Record<string, string>
// общий (без -large/-medium/-small суффикса), для onlyOne
const PNG_A_1X = import.meta.glob('/assets/images/**/*.png', { eager: true, as: 'url' }) as Record<string, string>
const PNG_A_2X = import.meta.glob('/assets/images/**/*@2x.png', { eager: true, as: 'url' }) as Record<string, string>

// --- WEBP: то же самое ---
const WEBP_L_1X = import.meta.glob('/assets/images/**/*-large.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_L_2X = import.meta.glob('/assets/images/**/*-large@2x.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_M_1X = import.meta.glob('/assets/images/**/*-medium.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_M_2X = import.meta.glob('/assets/images/**/*-medium@2x.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_S_1X = import.meta.glob('/assets/images/**/*-small.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_S_2X = import.meta.glob('/assets/images/**/*-small@2x.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_A_1X = import.meta.glob('/assets/images/**/*.webp', { eager: true, as: 'url' }) as Record<string, string>
const WEBP_A_2X = import.meta.glob('/assets/images/**/*@2x.webp', { eager: true, as: 'url' }) as Record<string, string>

const base = computed(() => `/assets/images/${props.path}`)

// Хелпер: собирает srcset "1x url, 2x url" из карт 1x/2x.
// Если нет 1x — берём 2x и для 1x слота (лучше показать ретина-картинку мельче, чем ничего).
// Если нет 2x — используем 1x и для 2x (это и есть тот случай "у нас всё в 2x").
// При onlyOne1x = true ретина игнорируется полностью: отдаём один URL без x-дескрипторов
// (приоритет 1x-файлу, если его нет — берём 2x как обычную картинку).
function buildSrcset(map1x: Record<string, string>, map2x: Record<string, string>, key1x: string, key2x: string, only1x = false): string {
  const url1x = map1x[key1x]
  const url2x = map2x[key2x]

  if (only1x)
    return url1x ?? url2x ?? ''

  if (url1x && url2x)
    return `${url1x} 1x, ${url2x} 2x`
  if (url2x)
    return `${url2x} 1x, ${url2x} 2x`
  if (url1x)
    return `${url1x} 1x, ${url1x} 2x`
  return ''
}

// --- PNG srcsets по размерам ---
const largePngSrcset = computed(() =>
  buildSrcset(PNG_L_1X, PNG_L_2X, `${base.value}/${props.name}-large.png`, `${base.value}/${props.name}-large@2x.png`, props.only1x) || defaultLargePng)
const mediumPngSrcset = computed(() =>
  buildSrcset(PNG_M_1X, PNG_M_2X, `${base.value}/${props.name}-medium.png`, `${base.value}/${props.name}-medium@2x.png`, props.only1x) || defaultMediumPng)
const smallPngSrcset = computed(() =>
  buildSrcset(PNG_S_1X, PNG_S_2X, `${base.value}/${props.name}-small.png`, `${base.value}/${props.name}-small@2x.png`, props.only1x) || defaultSmallPng)
const allPngSrcset = computed(() =>
  buildSrcset(PNG_A_1X, PNG_A_2X, `${base.value}/${props.name}.png`, `${base.value}/${props.name}@2x.png`, props.only1x) || defaultLargePng)

// Плейн-урл для img src (fallback без srcset) — если only1x, приоритет 1x-файлу
const smallPngUrl = computed(() =>
  props.only1x
    ? (PNG_S_1X[`${base.value}/${props.name}-small.png`] ?? PNG_S_2X[`${base.value}/${props.name}-small@2x.png`] ?? defaultSmallPng)
    : (PNG_S_2X[`${base.value}/${props.name}-small@2x.png`] ?? PNG_S_1X[`${base.value}/${props.name}-small.png`] ?? defaultSmallPng))
const allPngUrl = computed(() =>
  props.only1x
    ? (PNG_A_1X[`${base.value}/${props.name}.png`] ?? PNG_A_2X[`${base.value}/${props.name}@2x.png`] ?? defaultLargePng)
    : (PNG_A_2X[`${base.value}/${props.name}@2x.png`] ?? PNG_A_1X[`${base.value}/${props.name}.png`] ?? defaultLargePng))

// --- WEBP srcsets по размерам ---
const largeWebpSrcset = computed(() =>
  buildSrcset(WEBP_L_1X, WEBP_L_2X, `${base.value}/${props.name}-large.webp`, `${base.value}/${props.name}-large@2x.webp`, props.only1x))
const mediumWebpSrcset = computed(() =>
  buildSrcset(WEBP_M_1X, WEBP_M_2X, `${base.value}/${props.name}-medium.webp`, `${base.value}/${props.name}-medium@2x.webp`, props.only1x))
const smallWebpSrcset = computed(() =>
  buildSrcset(WEBP_S_1X, WEBP_S_2X, `${base.value}/${props.name}-small.webp`, `${base.value}/${props.name}-small@2x.webp`, props.only1x))
const allWebpSrcset = computed(() =>
  buildSrcset(WEBP_A_1X, WEBP_A_2X, `${base.value}/${props.name}.webp`, `${base.value}/${props.name}@2x.webp`, props.only1x))

const smallWebpUrl = computed(() =>
  props.only1x
    ? (WEBP_S_1X[`${base.value}/${props.name}-small.webp`] ?? WEBP_S_2X[`${base.value}/${props.name}-small@2x.webp`])
    : (WEBP_S_2X[`${base.value}/${props.name}-small@2x.webp`] ?? WEBP_S_1X[`${base.value}/${props.name}-small.webp`]))
const allWebpUrl = computed(() =>
  props.only1x
    ? (WEBP_A_1X[`${base.value}/${props.name}.webp`] ?? WEBP_A_2X[`${base.value}/${props.name}@2x.webp`])
    : (WEBP_A_2X[`${base.value}/${props.name}@2x.webp`] ?? WEBP_A_1X[`${base.value}/${props.name}.webp`]))
</script>

<template>
  <picture
    v-if="!onlyOne"
    class="image"
  >
    <!-- >=1024 -->
    <source
      v-if="largeWebpSrcset"
      :srcset="largeWebpSrcset"
      type="image/webp"
      media="(min-width: 1024px)"
    >
    <source
      v-if="!onlyWebp"
      :srcset="largePngSrcset"
      type="image/png"
      media="(min-width: 1024px)"
    >

    <!-- 844-1023 -->
    <source
      v-if="mediumWebpSrcset"
      :srcset="mediumWebpSrcset"
      type="image/webp"
      media="(min-width: 844px)"
    >
    <source
      v-if="!onlyWebp"
      :srcset="mediumPngSrcset"
      type="image/png"
      media="(min-width: 844px)"
    >

    <!-- <844 -->
    <source
      v-if="smallWebpSrcset"
      :srcset="smallWebpSrcset"
      type="image/webp"
    >

    <!-- Финальный фолбек -->
    <img
      v-if="onlyWebp"
      :src="smallWebpUrl ?? smallPngUrl"
      :alt="props.name || ''"
    >
    <img
      v-else
      :srcset="smallPngSrcset"
      :src="smallPngUrl"
      :alt="props.name || ''"
    >
  </picture>

  <picture
    v-else
    class="image"
  >
    <source
      v-if="allWebpSrcset"
      :srcset="allWebpSrcset"
      type="image/webp"
    >
    <img
      v-if="onlyWebp"
      :src="allWebpUrl ?? allPngUrl"
      :alt="props.name || ''"
    >
    <img
      v-else
      :srcset="allPngSrcset"
      :src="allPngUrl"
      :alt="props.name || ''"
    >
  </picture>
</template>

<style lang="scss" scoped>
img {
  width: 100%;
  height: 100%;
}
</style>
