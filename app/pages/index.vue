<script setup lang="ts">
import type { Component } from 'vue'
import { getHostPageKey } from '~~/shared/hostLandings'
import AmayaKidsL1 from './(amayakids.uz)/(subdomains)/l1/index.vue'
import AmayaKidsL2 from './(amayakids.uz)/(subdomains)/l2/index.vue'
import AmayaKidsTest from './(amayakids.uz)/(subdomains)/test/index.vue'
import AmayaSoftL1 from './(amayasoft.com)/(subdomains)/l1/index.vue'
import AmayaSoftL2 from './(amayasoft.com)/(subdomains)/l2/index.vue'
import AmayaSoftTest from './(amayasoft.com)/(subdomains)/test/index.vue'

const hostPages: Record<string, Component> = {
  'amayakids-uz-l1': AmayaKidsL1,
  'amayakids-uz-l2': AmayaKidsL2,
  'amayakids-uz-test': AmayaKidsTest,
  'amayasoft-com-l1': AmayaSoftL1,
  'amayasoft-com-l2': AmayaSoftL2,
  'amayasoft-com-test': AmayaSoftTest
}

const pageKey = getHostPageKey(useRequestURL().host)
const Landing = pageKey ? hostPages[pageKey] : null

if (!Landing) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>

<template>
  <Landing />
</template>
