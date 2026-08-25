<script setup lang="ts">
import HostLandingRouter from '~/components/domain-pages/HostLandingRouter.vue'
import { getHostLocaleConfig } from '~~/shared/hostLandings'

// This page is intentionally excluded from @nuxtjs/i18n's own routing/prefix
// machinery (which would otherwise force-redirect bare `/` to `/en` on its
// own, in a way we can't opt individual hosts out of). We own the redirect
// decision entirely ourselves here — see shared/hostLandings.ts.
definePageMeta({ i18n: false })

const config = getHostLocaleConfig(useAppHost())

if (config.localized) {
  await navigateTo(`/${config.defaultLocale}`, { redirectCode: 301 })
}
</script>

<template>
  <HostLandingRouter v-if="!config.localized" />
</template>
