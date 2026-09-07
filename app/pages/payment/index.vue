<script setup lang="ts">
import L1Payment from '~/pages/(amayasoft.uz)/(subdomains)/l1/payment/index.vue'

// Host-scoped sub-page dispatcher, same pattern as HostLandingRouter.vue but
// for a path other than `/` — see docs/domains-and-subdomains.md → "Как
// добавить доп. страницу для хоста". Hosts without an entry here 404.
//
// `i18n: false` is required for the same reason as app/pages/auth: with
// `strategy: 'prefix'`, @nuxtjs/i18n otherwise claims this path for itself
// and forces a `/:locale/payment` variant we don't want here.
definePageMeta({ i18n: false })

const Page = resolveHostPage({
  'amayasoft-uz-l1': L1Payment
})
</script>

<template>
  <Page />
</template>
