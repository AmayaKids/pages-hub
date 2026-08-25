<script setup lang="ts">
import HostLandingRouter from '~/components/domain-pages/HostLandingRouter.vue'
import { GLOBAL_LOCALES, getHostLocaleConfig, type LocaleCode } from '~~/shared/hostLandings'

// Manually-owned locale route for the landing dispatcher (see app/pages/index.vue
// for why it's excluded from @nuxtjs/i18n's own `/:locale` generation).
//
// `validate` is required because vue-router's `:lng` param otherwise matches ANY
// single path segment (e.g. `/some-random-page`), not just locale-shaped ones —
// without this, unknown single-segment paths would be silently swallowed by the
// locale-fallback logic below (redirected to `/` or `/${defaultLocale}`) instead
// of correctly 404ing.
definePageMeta({
  i18n: false,
  validate: route => /^[a-z]{2}$/.test(route.params.lng as string)
})

const route = useRoute()
const config = getHostLocaleConfig(useAppHost())

if (!config.localized) {
  // This host has no locale UI at all — the only canonical URL is bare `/`.
  await navigateTo('/', { redirectCode: 301 })
} else {
  const requestedLocale = route.params.lng as string
  const isKnownLocale = (GLOBAL_LOCALES as readonly string[]).includes(requestedLocale)
  const isSupportedForHost = isKnownLocale && (config.locales as readonly string[]).includes(requestedLocale)

  if (!isSupportedForHost) {
    await navigateTo(`/${config.defaultLocale}`, { redirectCode: 301 })
  } else {
    const { locale } = useI18n()
    locale.value = requestedLocale as LocaleCode
  }
}
</script>

<template>
  <HostLandingRouter v-if="config.localized" />
</template>
