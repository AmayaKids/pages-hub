<script setup lang="ts">
import AmayaKidsRoot from '~/pages/(amayakids.com)/index.vue'
import AmayaSoftL1 from '~/pages/(amayasoft.uz)/(subdomains)/l1/index.vue'
import AmayaSoftL2 from '~/pages/(amayasoft.uz)/(subdomains)/l2/index.vue'
import AmayaSoftTest from '~/pages/(amayasoft.uz)/(subdomains)/test/index.vue'

const Landing = resolveHostPage({
  'amayakids-com-root': AmayaKidsRoot,
  'amayasoft-uz-l1': AmayaSoftL1,
  'amayasoft-uz-l2': AmayaSoftL2,
  'amayasoft-uz-test': AmayaSoftTest
})
</script>

<template>
  <Landing />
</template>
