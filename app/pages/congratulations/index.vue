<script setup lang="ts">
import L1Congratulations from '~/pages/(amayasoft.uz)/(subdomains)/l1/congratulations/index.vue'
import L4Congratulations from '~/pages/(amayasoft.uz)/(subdomains)/l4/congratulations/index.vue'

// Host-scoped sub-page dispatcher — см. app/pages/payment/index.vue.
definePageMeta({ i18n: false })

const Page = resolveHostPage({
  'amayasoft-uz-l1': L1Congratulations,
  'amayasoft-uz-l4': L4Congratulations
})
</script>

<template>
  <Page />
</template>
