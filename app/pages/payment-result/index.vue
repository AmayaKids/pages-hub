<script setup lang="ts">
import L1PaymentResult from '~/pages/(amayasoft.uz)/(subdomains)/l1/payment-result/index.vue'

// Host-scoped sub-page dispatcher, same pattern as HostLandingRouter.vue but
// for a path other than `/` — see docs/domains-and-subdomains.md → "Как
// добавить доп. страницу для хоста". Hosts without an entry here 404.
//
// `i18n: false` is required for the same reason as app/pages/index.vue: with
// `strategy: 'prefix'`, @nuxtjs/i18n otherwise claims this path for itself
// (redirecting bare `/payment-result` towards a `/:locale/payment-result`
// variant we don't want), which pushes the request through our `[lng]`
// catch-all instead of this dispatcher.
definePageMeta({ i18n: false })

const Page = resolveHostPage({
  'amayasoft-uz-l1': L1PaymentResult
})
</script>

<template>
  <Page />
</template>
