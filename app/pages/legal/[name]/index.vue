<script setup lang="ts">
import L1Legal from '~/pages/(amayasoft.uz)/(subdomains)/l1/legal/[name]/index.vue'
import L2Legal from '~/pages/(amayasoft.uz)/(subdomains)/l2/legal/[name]/index.vue'
import L3Legal from '~/pages/(amayasoft.uz)/(subdomains)/l3/legal/[name]/index.vue'

// Host-scoped sub-page dispatcher, same pattern as HostLandingRouter.vue but
// for a path other than `/` — see docs/domains-and-subdomains.md → "Как
// добавить доп. страницу для хоста". Hosts without an entry here 404.
//
// `i18n: false` is required for the same reason as app/pages/payment-result:
// with `strategy: 'prefix'`, @nuxtjs/i18n otherwise claims this path for
// itself and forces a `/:locale/legal/:name` variant we don't want here.
definePageMeta({ i18n: false })

const Page = resolveHostPage({
  'amayasoft-uz-l1': L1Legal,
  'amayasoft-uz-l2': L2Legal,
  'amayasoft-uz-l3': L3Legal
})
</script>

<template>
  <Page />
</template>
