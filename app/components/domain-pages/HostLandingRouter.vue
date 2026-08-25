<script setup lang="ts">
import type { Component } from 'vue'
import { getHostPageKey } from '~~/shared/hostLandings'
import AmayaKidsRoot from '~/pages/(amayakids.com)/index.vue'
import AmayaSoftL1 from '~/pages/(amayasoft.uz)/(subdomains)/l1/index.vue'
import AmayaSoftL2 from '~/pages/(amayasoft.uz)/(subdomains)/l2/index.vue'
import AmayaSoftTest from '~/pages/(amayasoft.uz)/(subdomains)/test/index.vue'

const hostPages: Record<string, Component> = {
  'amayakids-com-root': AmayaKidsRoot,
  'amayasoft-uz-l1': AmayaSoftL1,
  'amayasoft-uz-l2': AmayaSoftL2,
  'amayasoft-uz-test': AmayaSoftTest
}

const pageKey = getHostPageKey(useAppHost())
const Landing = pageKey ? hostPages[pageKey] : null

if (!Landing) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>

<template>
  <Landing />
</template>
